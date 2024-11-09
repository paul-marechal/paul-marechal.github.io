---
layout: main
title: index
---

## What is this

Things I wish someone told me, I'll post here:

{% for post in site.posts %}

### `{{ post.categories | join: "/" | default: "#" }}` <a href="{{ post.url }}">{{ post.title }}</a> <small style="color:gray">{{ post.date | date: "%Y-%m-%d" }}</small>
> {{ post.excerpt | strip | newline_to_br }}
{% endfor %}
