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

<three-demo height="400" src="{% link /assets/js/demos/climb-demo.js %}" class="illustration interactive"></three-demo>

First let's assume that once someone jumped they follow [projectile motion equations](https://en.wikipedia.org/wiki/Projectile_motion#Kinematic_quantities) along the `Y` axis purely, meaning that once we've been set in motion the only force applied is gravity pulling down:

$$
\begin{aligned}
\text{Position (m) } \quad
y &= v_{0}t\sin(\theta)-\frac{1}{2}gt^2 \\

\text{Velocity (ms}^{-1}\text{) } \quad
v_{y} &= v_{0}\sin(\theta)-gt \\

\text{Acceleration (ms}^{-2}\text{) } \quad
a_{y} &= -g
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
a_{y} &= -g
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
y_{apex} &= \frac{v_{0}^2}{g}-\frac{v_{0}^2}{2g} \\
y_{apex} &= \frac{v_{0}^2}{2g} \\
% 2g(y_{apex}) &= v_{0}^2
\end{aligned}
$$

And now we have it: In order to reach some $$ y_{apex} $$ we need:

$$
v_{0} = \sqrt{2g(y_{apex})}
$$

And it will take $$ \sqrt{2g(y_{apex})} / g $$ seconds to reach after jumping!

<three-demo height="400" src="{% link /assets/js/demos/climb-chart.js %}" class="illustration interactive">
  <style> /* this style is leaky! */
    .consolas {
      font-family: consolas
    }
    #chart-controls {
      position: absolute;
      background-color: white;
      border: 0 solid black;
      border-width: 0 1px 1px 1px;
      padding: 3px;
      top: 1px;
      left: 50%;
      transform: translate(-50%, 0);
    }
    #chart-apex-label {
      position: absolute;
      color: darkred;
      bottom: 50%;
      left: 9%;
    }
    #chart-v0-label {
      position: absolute;
      color: blue;
      bottom: 9%;
      left: 10%;
    }
  </style>
  <span id="chart-controls" class="consolas">
    v0 offset: <input id="chart-v0-offset-input" type="range" min="-1" max="1" value="0" step="0.01" /> <label id="chart-v0-offset-label">+0.00</label>m/s
  </span>
  <label id="chart-v0-label" class="consolas">NaN</label>
  <label id="chart-apex-label" class="consolas">NaN</label>
</three-demo>

In the above example the <span style="color: blue;">blue line</span> represents the $$ y $$ position over time, you can move the <span style="color: darkred;">red line</span> which represents the target $$ y_{apex} $$, while also adding/removing some velocity to/from $$ v_{0} $$ using the slider at the top.

As you can see: if your $$ v_{0} $$ is too high you will overshoot the altitude you meant to reach, while if you are short on speed then you'll miss it!
