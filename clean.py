import os
import shutil
from pathlib import Path
from bs4 import BeautifulSoup, Comment
from loguru import logger

# --- Configuration ---
SOURCE_DIR = "downloaded_docs" 
CLEANED_DIR = "cleaned_rag_docs"

logger.add("cleanup_process.log", rotation="1 MB", level="INFO")

class StructuredRAGCleaner:
    def __init__(self, input_dir, output_dir):
        self.input_path = Path(input_dir)
        self.output_path = Path(output_dir)
        self.output_path.mkdir(parents=True, exist_ok=True)
        
        # Tags to remove completely from HTML
        self.tags_to_remove = [
            'script', 'style', 'noscript', 'iframe', 'svg', 
            'header', 'footer', 'nav', 'aside'
        ]
        
        # Selectors specific to LINE Dev portal noise
        self.noise_selectors = [
            '.sidebar', '.table-of-contents', '.pagination', 
            '.edit-page-link', '.feedback-section', '.language-selector',
            '.breadcrumb', '#header', '#footer'
        ]

    def clean_html(self, html_content):
        """Removes UI noise and strips non-essential attributes from HTML."""
        soup = BeautifulSoup(html_content, 'html.parser')

        # 1. Remove comments
        for comment in soup.find_all(string=lambda text: isinstance(text, Comment)):
            comment.extract()

        # 2. Remove noisy tags
        for tag in soup(self.tags_to_remove):
            tag.decompose()

        # 3. Remove UI noise selectors
        for selector in self.noise_selectors:
            for element in soup.select(selector):
                element.decompose()

        # 4. Target main content area
        main_content = soup.find('main') or soup.find('article') or soup.body or soup

        # 5. Strip styling attributes (class, id, style) to save RAG tokens
        allowed_attrs = ['href', 'src']
        for tag in main_content.find_all(True):
            tag.attrs = {name: value for name, value in tag.attrs.items() if name in allowed_attrs}

        return main_content.prettify()

    def run(self):
        if not self.input_path.exists():
            logger.error(f"Source directory '{SOURCE_DIR}' not found!")
            return

        # Recursively find all files in the directory structure
        all_files = list(self.input_path.rglob("*"))
        
        success_count = 0
        logger.info(f"Starting processing of {len(all_files)} items...")

        for item_path in all_files:
            if item_path.is_dir():
                continue

            # Recreate the directory structure in the output folder
            relative_path = item_path.relative_to(self.input_path)
            target_path = self.output_path / relative_path
            target_path.parent.mkdir(parents=True, exist_ok=True)

            try:
                if item_path.suffix.lower() == '.md':
                    # Passthrough: Just copy Markdown files
                    shutil.copy2(item_path, target_path)
                    logger.debug(f"Copied MD: {relative_path}")
                
                elif item_path.suffix.lower() == '.html':
                    # Clean: Process HTML files
                    with open(item_path, 'r', encoding='utf-8') as f:
                        raw_html = f.read()
                    
                    cleaned_html = self.clean_html(raw_html)
                    
                    with open(target_path, 'w', encoding='utf-8') as f:
                        f.write(cleaned_html)
                    logger.debug(f"Cleaned HTML: {relative_path}")
                
                else:
                    # Ignore other files (images, etc.) or copy them if needed
                    logger.debug(f"Skipping non-doc file: {relative_path}")
                    continue

                success_count += 1

            except Exception as e:
                logger.error(f"Failed to process {relative_path}: {e}")

        logger.success(f"Cleanup finished. {success_count} docs ready in '{CLEANED_DIR}'")

if __name__ == "__main__":
    cleaner = StructuredRAGCleaner(SOURCE_DIR, CLEANED_DIR)
    cleaner.run()

