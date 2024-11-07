---
layout: post
title: Orienting a VR Character
excerpt_separator: <!--more-->
---

I had to rotate a VR controller character following the player's HMD rotation and had to scratch my head a little...
<!--more-->

## The naive approach

Just follow a projection of the HMD forward vector on XZ:

```gdscript
var hmd_forward_xz := -hmd_basis.z * Vector3(1, 0, 1)
var rotation := Basis.looking_at(hmd_forward, Vector3.UP)
```

## The better approach

Intersect the HMD's YZ plane with the world's XZ plane:

```gdscript
var z := hmd_basis.x.cross(Vector3.UP)
var rotation := Basis(
    Vector3.UP.cross(z).normalized(),
    Vector3.UP,
    z.normalized()
)
```
