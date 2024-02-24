from flask import Flask, jsonify, render_template_string, redirect, url_for
import sqlite3
import os

app = Flask(__name__)

@app.route('/<path:path>', methods=['GET'])
def get_page_content(path):
    
    conn = sqlite3.connect('data.db')
    c = conn.cursor()

    # Fetch content from the database
    c.execute("SELECT data FROM content WHERE url=?", ("https://"+path,))
    content_data = c.fetchone()
    
    # Fetch incoming links to the page
    c.execute("SELECT source FROM links WHERE destination=?", ("https://"+path,))
    incoming_links_data = c.fetchall()

    conn.close()

    # If no content or links are found in the database, return a 404
    if not content_data:
        return "Page not found", 404
    
    incoming_links = [link[0] for link in incoming_links_data]

    # Construct the HTML response
    html_content = """
    <h2>URL:</h2>
    <ul>
    <a href="{{ local_url }}">{{ url }}</a>
    </ul>
    </br>
    <h2>List of the pages that link to the page</h2>
    <ul>
    {% for page in incoming_pages %}
        <li><a href="{{ page.local_url }}">{{ page.url }}</a></li>
    {% endfor %}
    </ul>
    """
    
    # Construct the incoming_pages list of dictionaries
    incoming_pages = [{"url": row, "local_url": row.split("/")[-1]} for row in incoming_links]
    
    # print( render_template_string(html_content, incoming_pages=incoming_pages, url="https://"+path, local_url=path.split("/")[-1]) )

    return render_template_string(html_content, incoming_pages=incoming_pages, url="https://"+path, local_url=path.split("/")[-1])


@app.route('/popular', methods=['GET'])
def popular_pages():
    # Connect to the SQLite database
    conn = sqlite3.connect('data.db')
    c = conn.cursor()

    # Query for the top 10 pages by incoming links
    c.execute('''SELECT destination, COUNT(destination) as link_count 
                 FROM links
                 GROUP BY destination
                 ORDER BY link_count DESC
                 LIMIT 10''')
    result = c.fetchall()

    conn.close()

    # HTML template for the response
    html_template = """
    <h2>Top 10 Pages by Incoming Links:</h2>
    <ul>
    {% for page in popular_pages %}
        <li><a href="{{ page.local_url }}">{{ page.url }}</a> ({{ page.count }})</li>
    {% endfor %}
    </ul>
    """

    # Construct the popular_pages list of dictionaries
    popular_pages = [{"url": row[0], "local_url": row[0].replace("https://", "").replace("http://", ""), "count": row[1]} for row in result]

    # Render and return the HTML response
    return render_template_string(html_template, popular_pages=popular_pages)



@app.route('/')
def index():
    # Redirect to /popular
    return redirect(url_for('popular_pages'))


if __name__ == "__main__":
    app.run(port=9999)
