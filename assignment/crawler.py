import sys
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import time
import random
import pickle
from collections import Counter, defaultdict
import redis

REDIS_URL = "localhost"
redis_cli = redis.Redis(REDIS_URL)

DATA_FILE = "data1.pkl"
FAILED_FILE = "failed2.txt"
INDEX_FILE = "index.pkl"


def run(start_url, output_file):
    q = [start_url]
    visited = {}
    failed_list = []
    while len(q) > 0 and len(visited) <= 1000:
        time.sleep(random.randint(1, 10) / 10)
        url = q.pop(0)

        text = None
        count = 0
        while text is None and count < 10:
            print(f"visiting: {len(visited) + 1} : {url}")
            try:
                text = requests.get(url).text
            except Exception as e:
                failed_list.append(url)
            count += 1

        if text is not None:
            visited[url] = text
            soup = BeautifulSoup(text, 'lxml')
            for a in soup.find_all('a'):
                try:
                    new_url = urljoin(url, a['href'])
                    if new_url not in q and new_url not in visited and same_domain(new_url, url):
                        q.append(new_url)
                except Exception as e:
                    pass

    print("total pages: "+str(len(visited)))
    with open(output_file+"_page.pkl", "wb") as f:
        for url, page in visited.items():
            redis_cli.set(url, page)
        pickle.dump(visited, f)

    with open(output_file+"_fail.txt", "w") as f:
        for url in failed_list:
            f.write(url + "\n")

    generate_index(output_file+"_page.pkl", output_file+"_index.pkl")


def same_domain(url1, url2):
    return urlparse(url1).netloc == urlparse(url2).netloc


def find_word_freq(bf):
    words = []
    for line in bf.text.split("\n"):
        words.extend(line.split(" "))
    return Counter(words)


def generate_index(data_file, output_file):
    with open(data_file, "rb") as f:
        data = pickle.load(f)
        ongoing = defaultdict(list)
        incoming = defaultdict(list)
        titles, freqs = {}, {}
        r_index = defaultdict(list)
        for url, page in data.items():
            soup = BeautifulSoup(page)
            title = soup.find('title').text
            word_freq = find_word_freq(soup)
            for word in word_freq:
                r_index[word].append(url)
            titles[url] = title
            freqs[url] = word_freq
            # print(url, title, word_freq)
            for a in soup.find_all('a'):
                try:
                    new_url = urljoin(url, a['href'])
                    if same_domain(new_url, url):
                        incoming[new_url].append(url)
                        ongoing[url].append(new_url)
                except Exception as e:
                    pass
        pr = calculate_page_rank(ongoing, incoming)

        with open(output_file, "wb") as f1:
            pickle.dump([titles, freqs, incoming, ongoing, pr, r_index], f1)
        print("index generated.")


def calculate_page_rank(ongoing, incoming):
    print("calculate pagerank...")
    all_nodes = set(ongoing.keys()) | set(incoming.keys())
    all_outgoing = {}
    for node in all_nodes:
        if node not in incoming:
            all_outgoing[node] = all_nodes
        else:
            all_outgoing[node] = set(ongoing[node])
    N = len(all_nodes)
    pr = {node: 1.0 / N for node in all_nodes}
    max_iter = 2000
    iter = 0
    alpha = 0.85

    while iter < max_iter:
        max_diff = 0
        new_pr = {}
        for node in all_nodes:
            v = (1 - alpha) / N
            for pre_node in incoming[node]:
                v += alpha * (pr[pre_node] / len(all_outgoing[pre_node]))
            max_diff = max(max_diff, abs(v - pr[node]))
            new_pr[node] = v
        if max_diff < 1e-7:
            break
        iter += 1
        pr = new_pr

    return pr


if __name__ == '__main__':
    fruit_url = 'https://people.scs.carleton.ca/~davidmckenney/fruitgraph/N-0.html'
    w3_url = 'https://www.w3schools.com/python/default.asp'
    if len(sys.argv) == 2:
        if sys.argv[1] == "fruits":
            run(fruit_url, "fruit")
        if sys.argv[1] == "personal":
            run(w3_url, "personal")
    else:
        run(fruit_url, "fruit")
        run(w3_url, "personal")
    # generate_index("fruit_page.pkl", "fruit_index.pkl")
    # generate_index("personal_page.pkl", "personal_index.pkl")
