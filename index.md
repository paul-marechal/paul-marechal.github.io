---
layout: default
title: index
---

## Posts
{% for post in site.posts %}

### `{{ post.categories | join: "/" }}` <a href="{{ post.url }}">{{ post.title }}</a> <small style="color:gray">{{ post.date | date: "%Y-%m-%d" }}</small>
> {{ post.excerpt | newline_to_br }}
{% endfor %}
