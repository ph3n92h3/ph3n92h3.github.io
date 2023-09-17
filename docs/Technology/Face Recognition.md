# :material-face-man: Face Recognition

> 我是真的没有想到人脸识别下限这么低。—— 桜井雪子

## 装库

- python
- python-opencv
- numpy
- pillow

> Linux 和 MacOS 需要小心，不要和系统的 python 环境冲突

一个简单的方法：装一个 `PyCharm`，在 `PyCharm` 里面换源、装库

## :material-camera: 摄像头拍照

```python
import cv2 as cv
import time

camera = cv.VideoCapture(0) # 摄像头

while True:
    flag, frame = camera.read()
    cv.imshow('save_image', frame)

    if not flag:
        break

    key = cv.waitKey(1) & 0xFF
    if key == ord('q'):
        break
    if key == ord('s'):
        image_name = time.strftime("%F %a %T", time.localtime()) + '.jpg'
        cv.imwrite('<图片所在目录>' + image_name, frame)
        print(image_name + ' saved')

camera.release()
cv.destroyAllWindows()
```

## haarcascades 人脸识别

分类器：[opencv haarcascades](https://githubfast.com/opencv/opencv/tree/master/data/haarcascades)

### :material-image: 图片

```python
import cv2 as cv

def imageFaceRecognition(image):
    faceDetector = cv.CascadeClassifier('<分类器 `.xml` 文件>')
    faceLocation = faceDetector.detectMultiScale(image)
    for x, y, w, h in faceLocation:
        cv.rectangle(image, (x, y, w, h), color = (0, 255, 0), thickness = 2)
        cv.putText(image, 'human', (x, y), fontFace = cv.FONT_HERSHEY_SIMPLEX, fontScale = 1, color = (0, 255, 0), thickness = 2)
    cv.imshow('image', image)

image = cv.imread('<图片文件位置>')

face(image)

cv.waitKey(0)
cv.destroyAllWindows()
```

### :material-camera: 摄像头

```python
import cv2 as cv
import time

camera = cv.VideoCapture(0) # 摄像头
faceDetector = cv.CascadeClassifier('<分类器 `.xml` 文件>')

while True:
    flag, frame = camera.read()

    if not flag:
        break

    key = cv.waitKey(1) & 0xFF
    if key == ord('q'):
        break

    faceLocation = faceDetector.detectMultiScale(frame)

    for x, y, w, h in faceLocation:
        cv.rectangle(frame, (x, y, w, h), color = (0, 255, 0), thickness = 2)
        cv.putText(frame, 'human', (x, y), fontFace = cv.FONT_HERSHEY_SIMPLEX, fontScale = 1, color = (0, 255, 0), thickness = 2)

    cv.imshow('frame', frame)

camera.release()
cv.destroyAllWindows()
```

### :material-video: 视频

```python

import cv2 as cv

video = cv.VideoCapture('<视频文件>')
faceDetector = cv.CascadeClassifier('<分类器 `.xml` 文件>')

while True:
    flag, frame = video.read()

    if not flag:
        break

    key = cv.waitKey(1) & 0xFF
    if key == ord('q'):
        break

    faceLocation = faceDetector.detectMultiScale(frame)

    for x, y, w, h in faceLocation:
        cv.rectangle(frame, (x, y, w, h), color = (0, 255, 0), thickness = 2)
        cv.putText(frame, 'human', (x, y), fontFace = cv.FONT_HERSHEY_SIMPLEX, fontScale = 1, color = (0, 255, 0), thickness = 2)

    cv.imshow('frame', frame)

video.release()
cv.destroyAllWindows()
```

## 人脸识别分类

~~说白了就是训练完能认出来这个人是谁，但是实在不知道怎么起这个小节的名字了~~

人脸图像集：[Labeled Faces in the Wild](http://vis-www.cs.umass.edu/lfw/index.html#download)

### 训练

```python
import cv2 as cv
import numpy as np
import os
from PIL import Image

def getFaceIndex(path):
    faceArray = []
    indexArray = []
    imagePaths = sorted(os.listdir(path))

    faceDetector = cv.CascadeClassifier('<分类器 `.xml` 文件>')

    index = 0
    for imagePath in imagePaths:
        grayImage = Image.open(path + '/' + imagePath).convert('L')
        imageNPArray = np.array(grayImage, 'uint8')
        faceLocation = faceDetect.detectMultiScale(imageNPArray)

        for x, y, w, h in faceLocation:
            faceArray.append(imageNPArray[y:y+h, x:x+w])
            indexArray.append(index)
            index += 1
    return faceArray, indexArray

faceArray , indexArray = getFaceIndex('<训练集目录>')

faceRecognizer = cv.face.LBPHFaceRecognizer.create()
faceRecognizer.train(faceArray, np.array(indexArray))
faceRecognizer.write('训练出的 .yml 文件')
```

### :material-image: 图片

```python
import cv2 as cv
import os

def getImageFileName(path):
    imageFileNameArray = []
    imagePaths = os.listdir(path)

    for imagePath in sorted(imagePaths):
        imageFileName = imagePath.split('_0')[0]
        imageFileNameArray.append(imageFileName)

    return imageFileNameArray

faceRecognizer = cv.face.LBPHFaceRecognizer.create()
faceRecognizer.read('训练出的 .yml 文件')

def imageFaceClassifier(image):
    imageGray = cv.cvtColor(image, cv.COLOR_BGR2GRAY)

    faceDetector = cv.CascadeClassifier('<分类器 `.xml` 文件>')

    faceLocation = faceDetector.detectMultiScale(imageGray)

    for x, y, w, h in faceLocation:
        cv.rectangle(image, (x, y, w, h), color = (0, 255, 0), thickness = 2)
        index, score = faceRecognizer.predict(imageGray[y:y+h, x:x+w])
        if score <= 80:
            cv.putText(image, getImageFileName('<训练集目录>')[index], (x + 10, y - 10), fontFace = cv.FONT_HERSHEY_SIMPLEX, fontScale = 1, color = (0, 255, 0), thickness = 2)
        else:
            cv.putText(image, "unknown", (x + 10, y - 10), fontFace = cv.FONT_HERSHEY_SIMPLEX, fontScale = 0.75, color = (0, 255, 0), thickness = 2) # 文字不能直接用中文
    cv.imshow('image', image)

image = cv.imread('<待检测图片>')

imageFaceClassifier(image)

cv.waitKey(0)
cv.destroyAllWindows()
```

### :material-camera: 摄像头

```python
import cv2 as cv
import os

def getImageFileName(path):
    imageFileNameArray = []
    imagePaths = os.listdir(path)

    for imagePath in sorted(imagePaths):
        imageFileName = imagePath.split('_0')[0]
        imageFileNameArray.append(imageFileName)

    return imageFileNameArray

faceRecognizer = cv.face.LBPHFaceRecognizer.create() # 获取识别器
faceRecognizer.read('训练出的 .yml 文件')

camera = cv.VideoCapture(0)
faceDetector = cv.CascadeClassifier('<分类器 `.xml` 文件>')

while True:
    flag, frame = camera.read()

    if not flag:
        break

    key = cv.waitKey(1) & 0xFF
    if key == ord('q'):
        break

    frameGray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    faceLocation = faceDetector.detectMultiScale(frameGray)
    for x, y, w, h in faceLocation:
        cv.rectangle(frame, (x, y, w, h), color = (0, 255, 0), thickness = 2)
        index, score = faceRecognizer.predict(frameGray[y:y+h, x:x+w])
        if score <= 80:
            cv.putText(frame, getImageFileName('<训练集目录>')[index], (x + 10, y - 10), fontFace = cv.FONT_HERSHEY_SIMPLEX, fontScale = 1, color = (0, 255, 0), thickness = 2)
        else:
            cv.putText(frame, "unknown", (x + 10, y - 10), fontFace = cv.FONT_HERSHEY_SIMPLEX, fontScale = 1, color = (0, 255, 0), thickness = 2)
    cv.imshow('frame', frame)

camera.release()
cv.destroyAllWindows()
```

### :material-video: 视频

```python
import cv2 as cv
import os

def getImageFileName(path):
    imageFileNameArray = []
    imagePaths = os.listdir(path)

    for imagePath in sorted(imagePaths):
        imageFileName = imagePath.split('_0')[0]
        imageFileNameArray.append(imageFileName)

    return imageFileNameArray

faceRecognizer = cv.face.LBPHFaceRecognizer.create() # 获取识别器
faceRecognizer.read('训练出的 .yml 文件')

cap = cv.VideoCapture('<视频文件>')
faceDetector = cv.CascadeClassifier('<分类器 `.xml` 文件>')

while True:
    flag, frame = cap.read()

    if not flag:
        break

    key = cv.waitKey(1) & 0xFF
    if key == ord('q'):
        break

    frameGray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    faceLocation = faceDetect.detectMultiScale(frameGray)
    for x, y, w, h in faceLocation:
        cv.rectangle(frame, (x, y, w, h), color = (0, 255, 0), thickness = 2)
        index, score = faceRecognizer.predict(frameGray[y:y+h, x:x+w])
        if score <= 75:
            cv.putText(frame, getImageFileName('<训练集目录>')[index], (x + 10, y - 10), fontFace = cv.FONT_HERSHEY_SIMPLEX, fontScale = 1, color = (0, 255, 0), thickness = 2)
        else:
            cv.putText(frame, "unknown", (x + 10, y - 10), fontFace = cv.FONT_HERSHEY_SIMPLEX, fontScale = 1, color = (0, 255, 0), thickness = 2)
    cv.imshow("frame", frame)

cap.release()
cv.destroyAllWindows()
```

---

## 附录

### :simple-bilibili: bilili 下载 bilibili 视频

```sh
bilili <url: https://www.bilibili.com/video/BV...> -c <SESSDATA> -q <quality>
```

- [bilili](https://bilili.nyakku.moe)
- [bilili 命令行参数](https://bilili.nyakku.moe/cli/)

### :simple-ffmpeg: ffmpeg 截取视频片段

```sh
ffmpeg -i <input file> -ss <begin time> -to <end time> <output file>
# ffmpeg -i input.mp4 -ss 00:01:30 -to 00:02:10 -c copy output.mp4
```

- [ffmpeg by 奇乐编程学院](https://www.bilibili.com/video/BV1AT411J7cH/)
