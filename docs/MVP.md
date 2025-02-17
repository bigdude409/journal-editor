# Photo Journal Editor MVP

## Features

* Subscription model.
    * Photographer tier.
    * Pro tier.
        * Editing tools + more storage
    * Journalist tier.
        * Pro + Higher bandwidth.
* Prints Store.
* AI shot suggestions?
* Mac and Windows desktop app.
    * Need to use Electron for webGPU support.
    * Use the users machine for AI processing.
* Import photos from a folder into a project/session/gallery.
* Edit each photo (batch?) using AI to fix lighting, etc.
    * Crop & Align
    * Auto:
        * White Balance
        * Brightness
        * Contrast
        * Enhance
        * Color
        * Tone
        * Sharpen
        * Noise
    * Suggest multiple styles based on AI analysis of the photo.
    * Apply a style based on a prompt. "Black and white photo highlighting the trees"
* Non-destructive editing. AI generated edits are not images, but entries on the edit stack
* Show Before/After slider after the edits.
* All AI is local. No data leaves the device until upload to the website.
    * This is important!  Photographers need to be assured that their photos are not being used to train AI.
* Select article layout and style.
* Add text/photos to the article.
* AI suggest articles based on photos.
* AI edit article.

* Upload to Photo Journal website.
* Post to social media.

## Tech

* React
* Electron
* Tailwind CSS
* Webpack
* TypeScript
* WebGPU for editing photos.
* TensorFlow.js for ML.
* OpenAI Moderation API for content filtering.
* OpenAI API for other ML operations.

## Backend

* Node.js
* Express
* MongoDB/Mongoose
* TypeScript