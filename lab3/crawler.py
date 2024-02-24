import requests
from bs4 import BeautifulSoup
import sqlite3
import os

BASE_URL = "https://people.scs.carleton.ca/~davidmckenney/fruitgraph/"
VISITED_URLS = set()


def get_content_and_links(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')
    
    # Extract text content from the page
    content = soup.find('p').get_text()
    
    # Extract all links from the page
    links = [a['href'] for a in soup.find_all('a', href=True)]
    
    return content, links

def init_db():
    conn = sqlite3.connect('tmp.db')
    c = conn.cursor()

    # Create table to store page content
    c.execute('''CREATE TABLE IF NOT EXISTS content (url TEXT, data TEXT)''')

    # Create table to store link relationships
    c.execute('''CREATE TABLE IF NOT EXISTS links (source TEXT, destination TEXT)''')
    
    return conn, c

def store_content_to_db(conn, c, url, content):
    # Insert page content into the database
    c.execute("INSERT INTO content (url, data) VALUES (?, ?)", (url, content))
    conn.commit()

def store_links_to_db(conn, c, url, links):
    # Insert link relationships into the database
    for link in links:
        next_url = BASE_URL + link.lstrip('./')
        c.execute("INSERT INTO links (source, destination) VALUES (?, ?)", (url, next_url))

    conn.commit()

def crawl(url, conn, c):
    print(url)
    VISITED_URLS.add(url)
    content, links = get_content_and_links(url)
    
    # Store content in the database
    store_content_to_db(conn, c, url, content)
    
    # Recursively crawl other links
    for link in links:
        next_url = BASE_URL + link.lstrip('./')
        if next_url not in VISITED_URLS:
            crawl(next_url, conn, c)
    
    # Store links in the database
    store_links_to_db(conn, c, url, links)

# Initialize database connection
conn, c = init_db()

# Start crawling
crawl(BASE_URL+"N-1.html", conn, c)

# Close database connection
conn.close()

# Copy temporary database to the main database
os.system("mv tmp.db data.db")