"""
Topic Clustering Module for News Pulse.
Uses TF-IDF vectorization and Agglomerative Cosine Distance clustering to group articles into topics.
"""

import logging
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import AgglomerativeClustering
from sklearn.metrics.pairwise import cosine_distances, cosine_similarity

logger = logging.getLogger("newspulse.clusterer")

# Configurable distance threshold (cosine distance = 1 - cosine similarity)
# Distance 0.65 => Similarity threshold 0.35
DEFAULT_DISTANCE_THRESHOLD = 0.65

def build_cluster_payloads(articles, distance_threshold=DEFAULT_DISTANCE_THRESHOLD):
    """
    Cluster a list of article dicts using TF-IDF + Cosine Distance.
    
    articles: list of dicts with keys: 'id', 'title', 'description', 'body_text', 'published_at'
    
    Returns: list of cluster dicts:
      [
        {
          'label': str,
          'start_time': datetime,
          'end_time': datetime,
          'article_ids': list[int]
        },
        ...
      ]
    """
    if not articles:
        return []
    
    if len(articles) == 1:
        art = articles[0]
        return [{
            "label": art["title"],
            "start_time": art["published_at"],
            "end_time": art["published_at"],
            "article_ids": [art["id"]]
        }]
        
    # 1. Prepare combined text corpus (Headline repeated twice for higher weight)
    corpus = []
    for a in articles:
        title = a.get("title", "")
        desc = a.get("description", "") or ""
        body = (a.get("body_text", "") or "")[:500]
        text = f"{title} {title} {desc} {body}"
        corpus.append(text)
        
    # 2. Vectorize using TF-IDF with unigrams & bigrams
    vectorizer = TfidfVectorizer(
        max_features=5000,
        stop_words="english",
        min_df=1,
        max_df=0.9,
        ngram_range=(1, 2),
        sublinear_tf=True
    )
    
    tfidf_matrix = vectorizer.fit_transform(corpus)
    
    # 3. Compute pairwise cosine distance matrix
    dist_matrix = cosine_distances(tfidf_matrix)
    
    # 4. Agglomerative clustering with distance threshold
    clustering = AgglomerativeClustering(
        n_clusters=None,
        distance_threshold=distance_threshold,
        metric="precomputed",
        linkage="average"
    )
    
    cluster_labels = clustering.fit_predict(dist_matrix)
    
    # 5. Group articles by cluster label
    clusters_map = {}
    for idx, label_id in enumerate(cluster_labels):
        if label_id not in clusters_map:
            clusters_map[label_id] = []
        clusters_map[label_id].append(idx)
        
    # 6. Build cluster objects with representative headline label
    result_clusters = []
    
    for label_id, member_indices in clusters_map.items():
        member_articles = [articles[i] for i in member_indices]
        
        # Sort members by published_at
        member_articles.sort(key=lambda x: x["published_at"])
        
        start_time = member_articles[0]["published_at"]
        end_time = member_articles[-1]["published_at"]
        article_ids = [a["id"] for a in member_articles]
        
        # Select representative label (most central headline in vector space)
        if len(member_articles) == 1:
            label = member_articles[0]["title"]
        else:
            member_vectors = tfidf_matrix[member_indices]
            sim_matrix = cosine_similarity(member_vectors)
            avg_sims = sim_matrix.mean(axis=1)
            central_idx = int(avg_sims.argmax())
            label = member_articles[central_idx]["title"]
            
        result_clusters.append({
            "label": label,
            "start_time": start_time,
            "end_time": end_time,
            "article_ids": article_ids
        })
        
    # Sort clusters by start_time descending (newest first)
    result_clusters.sort(key=lambda c: c["start_time"], reverse=True)
    return result_clusters
