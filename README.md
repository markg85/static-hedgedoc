# Static HedgeDoc renderer
[HedgeDoc](https://github.com/hedgedoc/hedgedoc) is a great real-time collaborative markdown editor! However, it misses the option to just render a markdown file with HedgeDoc settings. I had this need because I wanted to build a site page in HedgeDoc and just render the thing without the whole collaborative editing.

This project solves that itch. It renders your markdown mostly the same as HedgeDoc does.

## How to use this?
Do read on for the features this supports, adds and still want to implement!

Using it is as simple as:
* Clone this repo
* Change `mainpage.md` to your content
* Potentially change `index.html` if needed
* Upload to your site and done

There is a caveat though. I'm using a lot of `mjs` (module js) as extension. Your webserver needs to respond to `mjs` files as javascript content type! Your webserver probably has a default file to present (like index.html gets presented without typing it), you need to add `index.mjs` as default too so that a folder with just an `index.mjs` will have that be served up to the browser when accessing that folder.

## Known bugs and features I still want from HedgeDoc
If it's a bug it's prefixed with `:bug:` (rendered as :bug:), the rest are features you have in HedgeDock but not in the static renderer yet.
The bugs should be fixed at some point but i'd consider them not important enough to fix right now.

 * :bug: In mobile view the heading links, the link icon on the left, falls of the screen.
 * :bug: Some fenced block types that aren't parsable are undefined and thus break completely, handle that more gracefully and render as plain instead.
 * A floating TOC (Table Of Ccontent).
 * Dark mode toogle and autodetect, currently - and intentionally - there is just none of it.

## Breaking changes compared to HedgeDoc
I went to great lengths to make the rendering perfectly compatible. Sadly that isn't possible because I use the latest versions of libraries (HedgeDoc uses very old libraries) which undoubetly give some inconsistencies.

### Bootstrap, slightly different style
HedgeDoc uses boorstrap 3, I use 5. The default style in 3 is a little different then it was in 3 so you'll see subtle differences. Here are some more notable ones:
 * The alert blocks look slightly diffeent.
 * Links are slightly different colored and underline.
 * Color wise there's many subtle differences just because of the default bootstrap 5 theme

### FontAwesome
Initially i wanted to go for [ForkAwesome](https://forkaweso.me/Fork-Awesome/) and had that working, but it is abandoned and it itself recommands to just use FontAwesome.
HedgeDoc uses an old version of it, I'm using the newest version. Over time the icons just simply changed and some even got renamed. This means that FontAwesome icons probably mostly work but there will be visual changes and there will be some that don't work under their old name.

### System emojis
The emojis are system emojis, not the [emojify.js](https://github.com/joypixels/emojify.js ) package. That has been archived since 2018!

### No colored blockquote
The HedgeDoc blockquote has the option to style the bar it shows on the left per quote depth. The way this is done looks ugly to me and it's implementation is tricky at best so i'm not gonna bother supporting that. I eventually do want to have support for this functionality but not in the way it's currently done.

### No support for some external objects
HedgeDoc supports a wide variety of including external objects.
 * Embedding PDF. Don't know why that's useful, not supported.

And of the diagram external object i'm not supporting:
 * [sequence-diagrams](https://bramp.github.io/js-sequence-diagrams/)
 * [flowchart.js](https://flowchart.js.org/)
 * [graphviz](https://www.tonyballantyne.com/graphs.html)
 * [abc](https://abcnotation.com/learn)

Any of these could be possible though. I do support [mermaid](https://github.com/mermaid-js/mermaid).

## Extra features not found in HedgeDoc
While developing this I found myself wanting a couple more extra features that seemed simple enough to add.

### Besides emoji, also FontAwesome icons
Emojis like `:wink:` are supported, but FontAwesome icons are supported too in the same way. For example, want the `fa-upload` icon? Simply do `:fa-upload:`.
Want a _fixed width_ icon instead? Simply ammend it with `-fw` to become `:fa-upload-fw:`. All the classic icons are supported.

### Spoilers
The element that can be collapsed/expanded. You can wrap content in a spoiler block like so:
```
:::spoiler Click to show details
You found me :stuck_out_tongue_winking_eye:
:::
```
That would make it appear collapsed. Or if you want to have it expanded by default then you just add `{state="open"}` like so:
```
:::spoiler {state="open"} Expand the spoiler container by default
You found me :stuck_out_tongue_winking_eye:
:::
```

### Render CSV as table
You might want to render CSV data directly into a table, you can do that!
~~~
```csvpreview
firstName,lastName,email,phoneNumber
John,Doe,john@doe.com,0123456789
Jane,Doe,jane@doe.com,9876543210
James,Bond,james.bond@mi6.co.uk,0612345678
```
~~~
That block would render your CSV data into a table as if you had written a markdown table yourself.

### QR
Ever felt the need to render a QR code straight from HTML? Why not?!
~~~
```qr
Just something that should turn into a QR!
```
~~~
This would show a auto-scalable QR code that, when scanned, shows `Just something that should turn into a QR!`
You can change the size to your desire by appending `=<width>x<height>` or as a complete example, the following would render a 150x150 QR code:

~~~
```qr=150x150
Just something that should turn into a QR!
```
~~~

### MultiMarkdown (more advanced tables)
This is mostly fully supported as is written [here](https://fletcher.github.io/MultiMarkdown-6/syntax/tables.html) using [this](https://github.com/redbug312/markdown-it-multimd-table) plugin.
This example would render as a chessboard.
```
|--|--|--|--|--|--|--|--|
|♜|  |♝|♛|♚|♝|♞|♜|
|  |♟|♟|♟|  |♟|♟|♟|
|♟|  |♞|  |  |  |  |  |
|  |♗|  |  |♟|  |  |  |
|  |  |  |  |♙|  |  |  |
|  |  |  |  |  |♘|  |  |
|♙|♙|♙|♙|  |♙|♙|♙|
|♖|♘|♗|♕|♔|  |  |♖|
```
From that plugin nearly all options are enabled except for `multibody`. It would merge two tables if there is an empty line in between, while fancy, that is a bit too accident prone so that is disabled.
