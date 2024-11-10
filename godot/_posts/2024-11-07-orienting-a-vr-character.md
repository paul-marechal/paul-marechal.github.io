---
layout: post
title: Orienting a VR character
excerpt: Aligning a VR character following a player's headset can be tricky
tags:
  - godot
  - math
  - vr
assets:
  player_yz: https://emojigraph.org/media/emojidex/moai_1f5ff.png
---

## The naive approach

What if we just extended the vector coming out from the player's face?

On an [`XRCamera3D`](https://docs.godotengine.org/en/stable/classes/class_xrcamera3d.html) this would be its `-Z` vector (a.k.a. `-basis.z`).

Then we just follow a projection this vector on the world's `XZ` plane:

```gdscript
var hmd_forward_xz := -hmd_basis.z * Vector3(1, 0, 1)
var rotation := Basis.looking_at(hmd_forward_xz, Vector3.UP)
```

This would be the result:

<script type="module" src="/assets/js/demos/vr-hmd-forward.js"></script>
<div id="vr-hmd-forward-root" class="illustration interactive"></div>

One issue there happens when the player looks down to the ground: With only slight movements of the head it is possible to drastically alter the direction!

## The better approach

Considering a player looking down, the "face" vector can easily be moved to rotate the character in wild ways...

What if we started looking at the `+Y` vector when looking down? It's the vector going up from the top of your head. Then even if directly looking at their feet, this vector would more accurately represent the direction our player is facing!

The problem becomes how do we modulate between `-Z` and `+Y`?

This is where planes help us: If we consider a plane splitting our head in two from top to bottom then I'd like to orient the character controller alongside it and towards the horizon.

<svg width="100%" height="256px" xmlns="http://www.w3.org/2000/svg" class="illustration">
  <text x="12.5%" y="115" fill="#0AA" style="font-weight: bold;">Horizon</text>
  <line x1="0%" y1="50%" x2="100%" y2="50%" stroke="#0AA" stroke-width="3" />
  <svg x="50%" y="50%" style="overflow: visible;">
    <g>
      <animateTransform
        attributeName="transform"
        attributeType="XML"
        type="rotate"
        from="0 0 0"
        to="-360 0 0"
        dur="10s"
        repeatCount="indefinite" />
      <rect x="-128" y="-128" width="256" height="256" fill="#F0F3" />
      <circle cx="0" cy="0" r="100" fill="transparent" stroke="#A004" stroke-width="3" />
      <text x="10" y="-100" fill="#0A0" style="font-weight: bold;">+Y</text>
      <line x1="0" y1="0" x2="0" y2="-100" stroke="#0A0" stroke-width="5" />
      <text x="100" y="-10" fill="#66F" style="font-weight: bold;">+Z</text>
      <line x1="0" y1="0" x2="100" y2="0" stroke="#66F" stroke-width="5" />
      <image x="-64px" y="-64px" width="128px" height="128px" href="{{ page.assets.player_yz }}" transform-origin="center" />
    </g>
  </svg>
</svg>


Conveniently, we can represent the horizon as another plane and intersecting them should give us a line: This will be our direction!

The intersection is perpendicular to the normals of both planes: _[Cross product refresher...](https://en.wikipedia.org/wiki/Cross_product#Definition)_

$$
\begin{aligned}
  d = \vec{n}_a \times \vec{n}_b
\end{aligned}
$$

In our case we have:

$$
\begin{aligned}
  Z_{basis} = \vec{X}_{headset} \times (0, 1, 0)
\end{aligned}
$$

We can now build a [`Basis`](https://docs.godotengine.org/en/stable/classes/class_basis.html):

```gdscript
var y := Vector3.UP
var z := hmd_basis.x.cross(y).normalized()
var x := y.cross(z).normalized()
var rotation := Basis(x, y, z)
```

And this is the new result:

<script type="module" src="/assets/js/demos/vr-hmd-planes.js"></script>
<div id="vr-hmd-planes-root" class="illustration interactive"></div>

This provides a much more stable orientation for our character controller: We can now look down at our feet and tilt our head without changing our direction!
