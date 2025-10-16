"""
Main entry point for Yongin Council data scraping pipeline
"""
import logging
import argparse
from scrapers import councillors, meetings, bills

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def run_all():
    """Run all scrapers"""
    logger.info("Starting full scraping pipeline...")

    try:
        logger.info("=== Phase 1: Scraping Councillors ===")
        councillors.run()

        logger.info("=== Phase 2: Scraping Meetings ===")
        meetings.run()

        logger.info("=== Phase 3: Scraping Bills ===")
        bills.run()

        logger.info("Scraping pipeline completed successfully!")

    except Exception as e:
        logger.error(f"Scraping pipeline failed: {e}")
        raise

def main():
    parser = argparse.ArgumentParser(description='Yongin Council Data Scraper')
    parser.add_argument(
        '--target',
        choices=['all', 'councillors', 'meetings', 'bills'],
        default='all',
        help='Target to scrape'
    )

    args = parser.parse_args()

    if args.target == 'all':
        run_all()
    elif args.target == 'councillors':
        councillors.run()
    elif args.target == 'meetings':
        meetings.run()
    elif args.target == 'bills':
        bills.run()

if __name__ == "__main__":
    main()
