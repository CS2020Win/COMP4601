import requests
import numpy as np
import re
from bs4 import BeautifulSoup
from tqdm import tqdm

alpha=0.1
start_page = 0
end_page = 999
adjacency_matrix = np.zeros((end_page + 1, end_page + 1), dtype=float)

for page in tqdm(range(start_page, end_page + 1)):
    url = f"https://people.scs.carleton.ca/~davidmckenney/fruitgraph/N-{page}.html"
    response = None
    while response is None or response.status_code != 200:
        try:
            response = requests.get(url)
        except:
            pass
    if response.status_code == 200:
        soup = BeautifulSoup(response.text, 'html.parser')
#         print(soup.prettify())
        links = soup.find_all('a', href=True)
        num=0
        for link in links:
            href = link['href']
            target_page=int( re.findall(r'\d+', href)[0] )
            adjacency_matrix[page, target_page] = 1.0
            num=num+1
        if num == 0:
            adjacency_matrix[page, :] = 1.0/end_page
        else:
            adjacency_matrix[page] /= float(num)
            pass
    else:
        print(f"Failed to retrieve page {page}. Status code: {response.status_code}")
adjacency_matrix = (1.0-alpha)*adjacency_matrix+alpha*1.0/float(end_page - start_page + 1) 
pi = np.zeros((1, 1000), dtype = float)
pi[0, 0] = 1
prev_pi = np.zeros((1, 1000), dtype = float)
prev_pi[0, 0] = 10
while np.linalg.norm(prev_pi - pi) >= 0.0001:
    prev_pi = pi
    pi = pi @ adjacency_matrix
indices = np.argsort(pi[0])[::-1]
for i, idx in enumerate(indices):
    print(f'#{i + 1}. ({pi[0, idx]}) https://people.scs.carleton.ca/~davidmckenney/fruitgraph/N-{idx}.html')
