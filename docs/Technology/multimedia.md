## ffmpeg

Accelerate h265/hevc encoding with AMD core graphics:

```shell
ffmpeg -i <input file> -c:v hevc_amf <output file>
```

av1 encoding with CPU:

```shell
ffmpeg -i <input file> -c:v libsvtav1 <output file>
```

## imagemagick

Re-encoding to compress images:

```shell
magick <input file> <output file>
```

## qpdf

Re-encoding to compress pdfs:

```shell

```
