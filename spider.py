import asyncio
import json
import os
from pathlib import Path
from urllib.parse import urljoin, urlparse

import httpx
from bs4 import BeautifulSoup
from loguru import logger

# --- Configuration ---
BASE_URL = "https://developers.line.biz/ja/docs/messaging-api/"
ROOT_DIR = "downloaded_docs"  # The base folder
CACHE_FILE = "download_cache.json"
CONCURRENT_LIMIT = 5 

logger.add("downloader.log", rotation="5 MB", level="INFO")

class StructuredDownloader:
    def __init__(self):
        self.root_path = Path(ROOT_DIR)
        self.root_path.mkdir(parents=True, exist_ok=True)
        self.cache = self._load_cache()
        self.visited = set()
        self.queue = asyncio.Queue()
        self.semaphore = asyncio.Semaphore(CONCURRENT_LIMIT)
        self.replace_patterns = [BASE_URL, "/ja/docs/messaging-api/"]

    def _load_cache(self):
        if os.path.exists(CACHE_FILE):
            try:
                with open(CACHE_FILE, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Cache load error: {e}")
        return {}

    def _save_cache(self):
        with open(CACHE_FILE, 'w', encoding='utf-8') as f:
            json.dump(self.cache, f, indent=4, ensure_ascii=False)

    def _get_local_path(self, url):
        """Converts a URL into a local nested directory structure."""
        parsed = urlparse(url)
        # Remove the leading slash to make it relative to ROOT_DIR
        relative_path = parsed.path.lstrip('/')
        
        # If the path is empty or ends in a slash, treat it as an index file
        if not relative_path or relative_path.endswith('/'):
            target_path = Path(relative_path) / "index.html"
        elif relative_path.endswith('.md'):
            target_path = Path(relative_path)
        else:
            # Default to .html for documentation pages without extension
            target_path = Path(f"{relative_path}.html")
            
        return self.root_path / target_path

    def _process_content(self, content, url, is_html):
        """Extracts links and localizes paths only if it's an HTML file."""
        if not is_html:
            return content, set()

        soup = BeautifulSoup(content, 'html.parser')
        new_links = set()

        for a in soup.find_all('a', href=True):
            full_url = urljoin(url, a['href']).split('#')[0].rstrip('/')
            if full_url.startswith(BASE_URL):
                new_links.add(full_url)

        # Path Localization to relative './'
        tags_to_fix = {'a': 'href', 'img': 'src', 'link': 'href', 'script': 'src'}
        for tag, attr in tags_to_fix.items():
            for element in soup.find_all(tag, **{attr: True}):
                val = element[attr]
                for pattern in self.replace_patterns:
                    if val.startswith(pattern):
                        element[attr] = val.replace(pattern, "./", 1)
        
        return soup.prettify(), new_links

    async def worker(self, client):
        while True:
            url = await self.queue.get()
            try:
                async with self.semaphore:
                    local_file_path = self._get_local_path(url)
                    is_md = url.endswith('.md')
                    
                    # Create parent directories
                    local_file_path.parent.mkdir(parents=True, exist_ok=True)

                    if url in self.cache and local_file_path.exists():
                        logger.info(f"Checking Local: {url}")
                        with open(local_file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                    else:
                        logger.info(f"Downloading: {url}")
                        response = await client.get(url, timeout=15.0)
                        response.raise_for_status()
                        content = response.text

                    # Process: If HTML, find more links. If MD, just save.
                    processed_content, found_links = self._process_content(content, url, not is_md)
                    
                    with open(local_file_path, 'w', encoding='utf-8') as f:
                        f.write(processed_content)
                    
                    self.cache[url] = str(local_file_path.relative_to(self.root_path))

                    for link in found_links:
                        if link not in self.visited:
                            self.visited.add(link)
                            await self.queue.put(link)

                    logger.success(f"Saved to: {local_file_path.relative_to(self.root_path)}")

            except Exception as e:
                logger.error(f"Error processing {url}: {e}")
            finally:
                self.queue.task_done()

    async def run(self):
        self.visited.add(BASE_URL)
        await self.queue.put(BASE_URL)

        async with httpx.AsyncClient(follow_redirects=True) as client:
            workers = [asyncio.create_task(self.worker(client)) for _ in range(CONCURRENT_LIMIT)]
            await self.queue.join()
            for w in workers:
                w.cancel()
        
        self._save_cache()
        logger.info("Structured sync complete.")

if __name__ == "__main__":
    downloader = StructuredDownloader()
    try:
        asyncio.run(downloader.run())
    except KeyboardInterrupt:
        downloader._save_cache()

