---
layout: post
title: Obstacle-climbing Olympics
excerpt: How fast can one climb up a single step?
tags:
  - godot
  - math
---

## The problem

How fast do you think you can climb up something? Assuming a scene with only the ground, an elevated ground, the sky, and you?

<img alt="" src="">

First let's assume that once someone jumped they follow [projectile motion equations](https://en.wikipedia.org/wiki/Projectile_motion#Kinematic_quantities) along the `Y` axis purely, meaning that once we've been set in motion the only force applied is gravity pulling down:

$$
\begin{aligned}
\text{Position (m) } \quad
y &= v_{0}t\sin(\theta)-\frac{1}{2}gt^2 \\

\text{Velocity (ms}^{-1}\text{) } \quad
v_{y} &= v_{0}\sin(\theta)-gt \\

\text{Acceleration (ms}^{-2}\text{) } \quad
a_{y} &= -gt
\end{aligned}
$$

With $$ \theta = 90^{\circ} $$ we have $$ \sin(90^{\circ}) = 1 $$ and:

$$
\begin{aligned}
\text{Position (m) } \quad
y &= v_{0}t-\frac{1}{2}gt^2 \\

\text{Velocity (ms}^{-1}\text{) } \quad
v_{y} &= v_{0}-gt \\

\text{Acceleration (ms}^{-2}\text{) } \quad
a_{y} &= -gt
\end{aligned}
$$

Here we're interested in $$ v_{0} $$ as it's the velocity we got from jumping. Once in the air, this value will be constant in our system of equations.

What we're looking for is for what value of $$ v_{0} $$ will we eventually reach some apex $$ y_{apex} $$?

Let's consider velocity: Before reaching the apex we should be climbing, after passing the apex we should be falling, and our velocity should be null at the apex:

$$
0 = v_{0}-gt_{apex} = v_{apex}
$$

We can isolate $$ t_{apex} $$ from this as:

$$
t_{apex} = \frac{v_{0}}{g}
$$

Note that with these equations, at $$ t = 0 $$ we got $$ y = 0 $$, since we want to climb to some $$ y_{apex} $$ position we can write:

$$
y_{apex} = v_{0}t_{apex}-\frac{1}{2}gt_{apex}^2
$$

We replace $$ t_{apex} $$ by $$ v_{0}/g $$:

$$
\begin{aligned}
y_{apex} &= v_{0}(\frac{v_{0}}{g})-\frac{1}{2}g(\frac{v_{0}}{g})^2 \\
y_{apex} &= \frac{v_{0}^2}{g}-\frac{1}{2}\frac{v_{0}^2}{g} \\
y_{apex} &= \frac{2v_{0}^2 - v_{0}^2}{2g} \\
2g(y_{apex}) &= v_{0}^2
\end{aligned}
$$

And now we have it: In order to reach some $$ y_{apex} $$ we need:

$$
v_{0} = \sqrt{2g(y_{apex})}
$$

And it will take $$ \sqrt{2g(y_{apex})} / g $$ seconds to reach after jumping!
