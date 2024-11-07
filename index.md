---
layout: default
title: index
---

## Posts
{% for post in site.posts %}

### ({{ post.categories }}) <a href="{{ post.url }}">{{ post.title }}</a> {{ post.date }}
> {{ post.excerpt }}
{% endfor %}
