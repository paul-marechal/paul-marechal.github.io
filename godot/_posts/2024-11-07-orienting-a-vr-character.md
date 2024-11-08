---
layout: post
title: Orienting a VR Character
excerpt: Aligning a VR character following a player's headset is not as easy as one may think...
---

## The naive approach

What if we just extended the vector coming out from the player's face?

On an [`XRCamera3D`](https://docs.godotengine.org/en/stable/classes/class_xrcamera3d.html) this would be its `-Z` vector (a.k.a. `-basis.z`).

Then we just follow a projection this vector on the world's XZ plane:

```gdscript
var hmd_forward_xz := -hmd_basis.z * Vector3(1, 0, 1)
var rotation := Basis.looking_at(hmd_forward_xz, Vector3.UP)
```

This would be the result:

<script type="module" src="/assets/vr-hmd-forward.js"></script>
<div id="vr-hmd-forward-root" class="demo-threejs"></div>

One issue there happens when the player looks down to the ground: With just a few movement of the head it is possible to drastically alter the direction!

## The better approach

Considering a player looking down, the "face" vector can easily be moved to rotate the character in wild ways...

What if we started looking at the `+Y` vector when looking down? It's the vector going up from the top of your head. Then even if directly looking at their feet, this vector would more accurately represent the direction our player is facing!

The problem becomes how do we modulate between `-Z` and `+Y`?

This is where planes help us: If we consider a plane splitting our head in two from top to bottom, passing between our eyes, then I'd like to orient the character controller alongside it and towards the horizon.

Conveniently, we can represent the horizon as another plane and intersecting them should give us a line: This will be our direction!

Plane intersection equations were a bit too much for me, but I noticed that the direction of the intersection is perpendicular to both planes normals:

```gdscript
var direction := normal_a.cross(normal_b).normalized()
```

> [Cross product refresher...](https://en.wikipedia.org/wiki/Cross_product#Definition)

In our case we have:

- The player's headset `YZ` plane normal: `+X`.
- The horizon/world `XZ` plane normal: `Vector3.UP`.

Assuming the resulting direction is going to be our new `-Z` or forward vector, we can build a [`Basis`](https://docs.godotengine.org/en/stable/classes/class_basis.html):

```gdscript
var z := hmd_basis.x.cross(Vector3.UP)
var rotation := Basis(
    Vector3.UP.cross(z).normalized(),
    Vector3.UP,
    z.normalized()
)
```

This is the new result:

<script type="module" src="/assets/vr-hmd-planes.js"></script>
<div id="vr-hmd-planes-root" class="demo-threejs"></div>

This provides a much more stable orientation for our character controller: We can now look down at our feet and tilt our head without changing our direction!
