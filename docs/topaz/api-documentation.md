API Documentation
=================

Welcome to the Image Enhancement API!

*   Upscale. Output high-resolution images without artifacting.
*   Fidelity. Input image improvement without significant data loss or distortion.
*   Efficiency. Low per-image cost with maximum speed.

The Image Enhancement API is a service which allows you to transform images with our industry-leading AI models for upscaling, denoising, sharpening, face recovery, and more.

![An example of an image enhanced by the API](https://d15k2d11r6t6rl.cloudfront.net/pub/bfra/1i9zrqmh/v0q/5mz/mf0/Screenshot%202024-09-05%20at%208.53.51%E2%80%AFAM.png)

An example of an image enhanced by the API

Getting started
===============

Resources
---------

To learn more about the details behind our AI models and capabilities, reference our desktop software application documentation below:

*   [AI models](https://docs.topazlabs.com/gigapixel-ai/filters-panel/ai-models)
*   [Face recovery](https://docs.topazlabs.com/gigapixel-ai/filters-panel/face-selection-and-recovery)

Authentication
--------------

You will need your Topaz API key in order to make requests to this API. Make sure you never share your API key with anyone, and you never commit it to a public repository.

Once you receive your API key, please use the following procedure:

*   **Uncommon (Deprecating Soon):** If your key begins with the string `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJtYWNoaW5lX2lkIjoi` Your key should be set as the `Authorization` header of your requests with the prefix `Bearer` .
    
*   **Standard:** If your key doesn't match the previous scenario, your API key should be set as the `X-API-Key` header of your requests. If you received an API key from Topaz after October 8th 2024, this is the methodology which you should follow.
    

Please contact [support](https://mailto:enterprise@topazlabs.com) if any assistance is needed.

Please visit [https://www.topazlabs.com/api](https://www.topazlabs.com/api) to get started with an API key if you have not already.

API restrictions
----------------

*   The API has access rate limits depending on the current load on the servers. If you receive a HTTP 429 response, please try again (soon). We recommend using an exponential backoff for the requests to avoid immediately hitting the limit again.
*   The API only responds to HTTPS-secured communications. Any requests sent via HTTP return an HTTP 301 redirect to the corresponding HTTPS resources.
*   The API enforces a request size limit of 500MB. If a request exceeds this limit, the server responds with an HTTP 413. Please ensure that requests stay within the size constraint to avoid this error.

Contact
-------

Please reach out to [enterprise@topazlabs.com](mailto:enterprise@topazlabs.com) with any questions.

Available models
================

Enhance
-------

These are our industry-standard upscaling and image enhancement models, which run blazingly fast and work great for most scenarios.

View More

**Model**

**Description**

**Parameters**

`Standard V2`

General-purpose model balancing detail, sharpness, and noise reduction for various images.

\- `denoise`  
\- `sharpen`  
\- `fix_compression`

`Low Resolution V2`

Enhances clarity and detail in low-resolution images like web graphics and screenshots.

\- `denoise`  
\- `sharpen`  
\- `fix_compression`

`CGI`

Optimized for CGI and digital illustrations, enhancing texture and detail in computer-generated images.

\- `denoise`  
\- `sharpen`

`High Fidelity V2`

Ideal for high-quality images, preserving intricate details in professional photography.

\- `denoise`  
\- `sharpen`  
\- `fix_compression`

`Text Refine`

Designed for images with text and shapes, enhancing clarity and sharpness of elements.

\- `denoise`  
\- `sharpen`  
\- `fix_compression`

### Parameter Notes

*   `denoise`: Controls the level of noise reduction (decimal from 0 to 1).
*   `sharpen`: Adjusts image sharpness (decimal from 0 to 1).
*   `fix_compression`: Reduces artifacts due to compression (decimal from 0 to 1).

These parameters should be appended as key-value fields in the form-data request bodies (i.e. alongside the `model`, `output_height`, and `face_enhancement` etc. fields). Any parameters not explicitly provided are **automatically** configured by our auto-parameter model. Extra parameters provided that are not supported are ignored.

Enhance Generative
------------------

Our latest cutting-edge and most powerful generative AI models which can repair, reconstruct, and enhance your images. These models only run asynchronously.

**Model**

**Description**

**Parameters**

`Redefine`

Elevate creativity with realistic upscaling, prioritizing either fidelity or creative detail. Ideal for low-resolution, blurry, and AI-generated images.

\- `prompt`  
\- `creativity`  
\- `texture`  
\- `denoise`  
\- `sharpen`

`Recovery`

Delivers high fidelity upscaling for extremely low-resolution images, preserving natural detail and sharpness.

### Parameter Notes

*   `prompt`: A description of the resulting image you are looking for. **The model responds more to a descriptive statement versus a directive one**. For example, use the phrase "girl with red hair and blue eyes" instead of "change the girl's hair to red and make her eyes blue". (text - max 1024 characters).
*   `creativity`: Adjusts the model's creativity during generation (integer from 1 to 6).
*   `texture`: Adjusts the amount of detail to be generated (integer from 1 to 5).
*   `denoise`: Controls the level of extra noise reduction (decimal from 0 to 1).
*   `sharpen`: Controls the level of extra sharpening (decimal from 0 to 1).

These parameters should be appended as key-value fields in the form-data request bodies (i.e. alongside the `model`, `output_height`, and `face_enhancement` etc. fields). Any parameters not explicitly provided are **automatically** configured by our auto-parameter model. Extra parameters provided that are not supported are ignored.

OpenAPI 3.0 Specification
=========================

View More

yaml

    openapi: '3.0.3'
    info:
      version: '1.0.0'
      title: 'Image Enhancement API'
      description: |
        Welcome to the Image Enhancement API!
        - Upscale. Output high-resolution images without artifacting.
        - Fidelity. Input image improvement without significant data loss or distortion.
        - Efficiency. Low per-image cost with maximum speed.
    
        The Image Enhancement API is a service which allows you to transform images with our industry-leading AI models for upscaling, denoising, sharpening, face recovery, and more.
    
        <img src="https://d15k2d11r6t6rl.cloudfront.net/pub/bfra/1i9zrqmh/v0q/5mz/mf0/Screenshot%202024-09-05%20at%208.53.51%E2%80%AFAM.png" alt="An example of an image enhanced by the API">
    
        # Getting started
    
        ## Resources
        To learn more about the details behind our AI models and capabilities, reference our desktop software application documentation below:
        - [AI models](https://docs.topazlabs.com/gigapixel-ai/filters-panel/ai-models)
        - [Face recovery](https://docs.topazlabs.com/gigapixel-ai/filters-panel/face-selection-and-recovery)
    
        ## Authentication
        You will need your Topaz API key in order to make requests to this API. Make sure you never share your API key with anyone, and you never commit it to a public repository.
    
        Once you receive your API key, please use the following procedure:
    
          1. **Uncommon (Deprecating Soon):** If your key begins with the string `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJtYWNoaW5lX2lkIjoi`
          Your key should be set as the `Authorization` header of your requests with the prefix `Bearer `.
    
          2. **Standard:** If your key doesn't match the previous scenario, your API key should be set as the `X-API-Key` header of your requests. If you received an API key from Topaz after October 8th 2024, this is the methodology which you should follow.
    
        Please contact [support](https://mailto:enterprise@topazlabs.com) if any assistance is needed.
    
        Please visit [https://www.topazlabs.com/api](https://www.topazlabs.com/api) to get started with an API key if you have not already.
    
        ## API restrictions
        - The API has access rate limits depending on the current load on the servers. If you receive a HTTP 429 response, please try again (soon). We recommend using an exponential backoff for the requests to avoid immediately hitting the limit again.
        - The API only responds to HTTPS-secured communications. Any requests sent via HTTP return an HTTP 301 redirect to the corresponding HTTPS resources.
        - The API enforces a request size limit of 500MB. If a request exceeds this limit, the server responds with an HTTP 413. Please ensure that requests stay within the size constraint to avoid this error.
    
        ## Contact
        Please reach out to enterprise@topazlabs.com with any questions.
    
        # Available models
    
        ## Enhance
        These are our industry-standard upscaling and image enhancement models, which run blazingly fast and work great for most scenarios.
    
        | **Model**           | **Description**                                                                                         | **Parameters**                                      |
        | ------------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
        | `Standard V2`       | General-purpose model balancing detail, sharpness, and noise reduction for various images.              | - `denoise`<br> - `sharpen`<br> - `fix_compression` |
        | `Low Resolution V2` | Enhances clarity and detail in low-resolution images like web graphics and screenshots.                 | - `denoise`<br> - `sharpen`<br> - `fix_compression` |
        | `CGI`               | Optimized for CGI and digital illustrations, enhancing texture and detail in computer-generated images. | - `denoise`<br> - `sharpen`                         |
        | `High Fidelity V2`  | Ideal for high-quality images, preserving intricate details in professional photography.                | - `denoise`<br> - `sharpen`<br> - `fix_compression` |
        | `Text Refine`       | Designed for images with text and shapes, enhancing clarity and sharpness of elements.                  | - `denoise`<br> - `sharpen`<br> - `fix_compression` |
    
        ### Parameter Notes
        - `denoise`: Controls the level of noise reduction (decimal from 0 to 1).
        - `sharpen`: Adjusts image sharpness (decimal from 0 to 1).
        - `fix_compression`: Reduces artifacts due to compression (decimal from 0 to 1).
    
        These parameters should be appended as key-value fields in the form-data request bodies (i.e. alongside the `model`, `output_height`, and `face_enhancement` etc. fields). Any parameters not explicitly provided are **automatically** configured by our auto-parameter model. Extra parameters provided that are not supported are ignored.
    
        ## Enhance Generative
        Our latest cutting-edge and most powerful generative AI models which can repair, reconstruct, and enhance your images. These models only run asynchronously.
    
        | **Model**  | **Description**                                                                                                                                          | **Parameters**                                                                |
        | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
        | `Redefine` | Elevate creativity with realistic upscaling, prioritizing either fidelity or creative detail. Ideal for low-resolution, blurry, and AI-generated images. | - `prompt`<br> - `creativity`<br> - `texture`<br> - `denoise`<br> - `sharpen` |
        | `Recovery` | Delivers high fidelity upscaling for extremely low-resolution images, preserving natural detail and sharpness.                                           |                                                                               |
    
        ### Parameter Notes
        - `prompt`: A description of the resulting image you are looking for. **The model responds more to a descriptive statement versus a directive one**. For example, use the phrase "girl with red hair and blue eyes" instead of "change the girl's hair to red and make her eyes blue". (text - max 1024 characters).
        - `creativity`: Adjusts the model's creativity during generation (integer from 1 to 6).
        - `texture`: Adjusts the amount of detail to be generated (integer from 1 to 5).
        - `denoise`: Controls the level of extra noise reduction (decimal from 0 to 1).
        - `sharpen`: Controls the level of extra sharpening (decimal from 0 to 1).
    
        These parameters should be appended as key-value fields in the form-data request bodies (i.e. alongside the `model`, `output_height`, and `face_enhancement` etc. fields). Any parameters not explicitly provided are **automatically** configured by our auto-parameter model. Extra parameters provided that are not supported are ignored.
    
    
    servers:
      - url: https://api.topazlabs.com/image/v1
        description: Production Base URL
    
    
    tags:
      - name: Enhance
        description: |
          Enhance images by removing noise, sharpening, and upscaling while preserving the details of your image, including the faces of important subjects.
    
          Just pass in an image and our **Autopilot** will automatically determine the best settings for the highest quality.
    
          Additional configuration can be optionally provided, specifically:
            - `model`
            - `output_height`
            - `output_width`
            - `output_format`
            - `crop_to_fill`
            - `face_enhancement`
            - `face_enhancement_creativity`
          
          Please see the reference for further details. Check out the [available models](#available-models) to see which model options you have.
      - name: Enhance Generative
        description: |
          Use our most powerful models to repair, reconstruct, and enhance images by generating new photo-realistic details. These models are more generative as compared to our standard models.
    
          Just pass in an image and our **Autopilot** will automatically determine the best settings for the highest quality.
    
          Additional configuration can be optionally provided, specifically:
            - `model`
            - `output_height`
            - `output_width`
            - `output_format`
            - `crop_to_fill`
            - `face_enhancement`
            - `face_enhancement_creativity`
          
          Please see the reference for further details. Check out the [available models](#available-models) to see which model options you have.
    
          > No synchronous endpoints are available since these powerful diffusion models can take up to several minutes to complete; blocking a HTTP request for extended periods of time is not recommended.
      - name: Status
        description: |
          Check and manage the statuses of your image enhancement jobs. Whether you are handling a single job or managing a queue of bulk image enhancements, the Status endpoints allow you to monitor the progress and completion of your tasks.
          
          This is particularly useful for long-running jobs, where you can track progress and retrieve details such as percentage completion, estimated finish time, and current state (e.g., pending, processing, completed).
      - name: Download
        description: |
          Access presigned URLs for downloading processed images. Once an image has been enhanced, the Download endpoint allows you to securely retrieve it with an expiring URL.
      - name: Estimate
        description: |
          Our estimates will allow you to predict the amount of time required and the number of credits that would be consumed in order to run a set of enhancements on a given image with certain input parameters.
      - name: Cancel
        description: |
          If an image enhancement job is no longer needed or was started in error, you can cancel it before it completes. The job must be in a cancellable state (e.g., not already completed or failed) for the request to be successful.
    
    paths:
      /enhance/async:
        post:
          tags:
            - Enhance
          summary: Enhance (asynchronous)
          operationId: postEnhanceAsync
          description: |
            Generally recommended. An asynchronous endpoint when you need to enhance a large amount of images or when you don't need an immediate result. Use this endpoint for:
              - Most jobs, where you don't need the image as soon as it has been enhanced
              - Bulk processing of a large amount of images
              - Freeing up threads during runtime while using the API
              - Running jobs which require status update polling
    
            Returns `process_id` and `eta` to use as an efficient way to track the progress of the image enhancement job:
              - Use the `Status` endpoints to check the status of this job using the returned `process_id`.
              - Use the `Download` endpoint to download the processed image once it is ready.
              - Use the `Cancel` endpoint to cancel the job while it is in progress.
    
            The same `process_id` and `eta` are also returned in the response headers as `X-Process-Id` and `X-ETA` respectively.
    
            > The `eta` represents when the job is expected to finish in Unix time. We recommend using this to know when you can expect your (bulk) jobs to finish processing.
    
            Output dimensions of 512 megapixels is the maximum supported.
          requestBody:
            content:
              multipart/form-data:
                schema:
                  $ref: '#/components/schemas/EnhanceRequest'
          responses:
            200:
              description: Image processing request has been successfully created.
              headers:
                X-Process-Id:
                  description: Unique identifier of the image enhancement job.
                  schema:
                    type: string
                    example: d7b3b3b3-7b3b-4b3b-8b3b-3b3b3b3b3b3b
                X-ETA:
                  description: Estimated time of arrival (ETA) for the process to complete in Unix time.
                  schema:
                    type: integer
                    example: 1617220000
              content:
                application/json:
                  schema:
                    $ref: '#/components/schemas/AsyncResponse'
              links:
                GetStatusByProcessId:
                  description: Retrieve the status of your image enhancement job using the `process_id`.
                  operationId: getStatus
                  parameters:
                    process_id: $response.header.X-Process-Id
                DownloadByProcessId:
                  description: Access the download link for the enhanced image once the job is completed.
                  operationId: getDownload
                  parameters:
                    process_id: $response.header.X-Process-Id
                CancelByProcessId:
                  description: Cancel the image enhancement job if it is still in progress.
                  operationId: cancelEnhance
                  parameters:
                    process_id: $response.header.X-Process-Id
            400:
              $ref: '#/components/responses/BadRequestImage'
            401:
              $ref: '#/components/responses/Unauthorized'
            402:
              $ref: '#/components/responses/PaymentRequired'
            403:
              $ref: '#/components/responses/Forbidden'
            412:
              $ref: '#/components/responses/PreconditionFailed'
            413:
              $ref: '#/components/responses/RequestEntityTooLarge'
            415:
              $ref: '#/components/responses/UnsupportedMediaType'
            422:
              $ref: '#/components/responses/UnprocessableEntity'
            429:
              $ref: '#/components/responses/TooManyRequests'
            500:
              $ref: '#/components/responses/InternalServerError'
    
      /enhance:
        post:
          tags:
            - Enhance
          summary: Enhance (synchronous)
          operationId: postEnhanceSync
          description: |
            A synchronous endpoint for enhancing your image.
    
            Returns the enhanced image as a binary with one of the following MIME types depending on the chosen `output_format` (defaulting to JPEG):
              - `image/jpeg` for JPEG output.
              - `image/png` for PNG output.
              - `image/tiff` for TIFF output.
    
            Additionally, returns `process_id` and `eta` as response headers `X-Process-Id` and `X-ETA` respectively to use as an efficient way to track the progress of the image enhancement job:
              - Use the `Status` endpoints to check the status of this job using the returned `process_id`.
              - Use the `Download` endpoint to download the processed image once it is ready.
              - Use the `Cancel` endpoint to cancel the job while it is in progress.
    
            > The `eta` represents when the job is expected to finish in Unix time.
    
            This endpoint can return a maximum of 96 megapixels; please see the `Enhance (asynchronous)` endpoint if you wish to upscale to larger dimensions.
          requestBody:
            content:
              multipart/form-data:
                schema:
                  $ref: '#/components/schemas/EnhanceRequest'
          responses:
            200:
              description: Image enhanced successfully.
              headers:
                X-Process-Id:
                  description: Unique identifier of the image enhancement job.
                  schema:
                    type: string
                    example: d7b3b3b3-7b3b-4b3b-8b3b-3b3b3b3b3b3b
                X-ETA:
                  description: Estimated time of arrival (ETA) for the process to complete in Unix time.
                  schema:
                    type: integer
                    example: 1617220000
              content:
                image/jpeg:
                  schema:
                    $ref: '#/components/schemas/SyncResponse'
                image/png:
                  schema:
                    $ref: '#/components/schemas/SyncResponse'
                image/tiff:
                  schema:
                    $ref: '#/components/schemas/SyncResponse'
              links:
                GetStatusByProcessId:
                  description: Retrieve the status of your image enhancement job using the `process_id`.
                  operationId: getStatus
                  parameters:
                    process_id: $response.header.X-Process-Id
                DownloadByProcessId:
                  description: Access the download link for the enhanced image once the job is completed.
                  operationId: getDownload
                  parameters:
                    process_id: $response.header.X-Process-Id
                CancelByProcessId:
                  description: Cancel the image enhancement job if it is still in progress.
                  operationId: cancelEnhance
                  parameters:
                    process_id: $response.header.X-Process-Id
            400:
              $ref: '#/components/responses/BadRequestImage'
            401:
              $ref: '#/components/responses/Unauthorized'
            402:
              $ref: '#/components/responses/PaymentRequired'
            403:
              $ref: '#/components/responses/Forbidden'
            412:
              $ref: '#/components/responses/PreconditionFailed'
            413:
              $ref: '#/components/responses/RequestEntityTooLarge'
            415:
              $ref: '#/components/responses/UnsupportedMediaType'
            422:
              $ref: '#/components/responses/UnprocessableEntity'
            429:
              $ref: '#/components/responses/TooManyRequests'
            500:
              $ref: '#/components/responses/InternalServerError'
    
      /enhance-gen/async:
        post:
          tags:
            - Enhance Generative
          summary: Enhance Generative (asynchronous)
          operationId: postEnhanceGenAsync
          description: |
            An asynchronous endpoint when you need to enhance a large amount of images or when you don't need an immediate result. Use this endpoint for:
              - Most jobs, where you don't need the image as soon as it has been enhanced
              - Bulk processing of a large amount of images
              - Freeing up threads during runtime while using the API
              - Running jobs which require status update polling
    
            Returns `process_id` and `eta` to use as an efficient way to track the progress of the image enhancement job:
              - Use the `Status` endpoints to check the status of this job using the returned `process_id`.
              - Use the `Download` endpoint to download the processed image once it is ready.
              - Use the `Cancel` endpoint to cancel the job while it is in progress.
    
            The same `process_id` and `eta` are also returned in the response headers as `X-Process-Id` and `X-ETA` respectively.
    
            > The `eta` represents when the job is expected to finish in Unix time. We recommend using this to know when you can expect your (bulk) jobs to finish processing.
    
            Output dimensions of 256 megapixels is the maximum supported. The `Recovery` model has an additional limit of 16 megapixels as **input** dimensions.
          requestBody:
            content:
              multipart/form-data:
                schema:
                  $ref: '#/components/schemas/EnhanceGenRequest'
          responses:
            200:
              description: Image processing request has been successfully created.
              headers:
                X-Process-Id:
                  description: Unique identifier of the image enhancement job.
                  schema:
                    type: string
                    example: d7b3b3b3-7b3b-4b3b-8b3b-3b3b3b3b3b3b
                X-ETA:
                  description: Estimated time of arrival (ETA) for the process to complete in Unix time.
                  schema:
                    type: integer
                    example: 1617220000
              content:
                application/json:
                  schema:
                    $ref: '#/components/schemas/AsyncResponse'
              links:
                GetStatusByProcessId:
                  description: Retrieve the status of your image enhancement job using the `process_id`.
                  operationId: getStatus
                  parameters:
                    process_id: $response.header.X-Process-Id
                DownloadByProcessId:
                  description: Access the download link for the enhanced image once the job is completed.
                  operationId: getDownload
                  parameters:
                    process_id: $response.header.X-Process-Id
                CancelByProcessId:
                  description: Cancel the image enhancement job if it is still in progress.
                  operationId: cancelEnhance
                  parameters:
                    process_id: $response.header.X-Process-Id
            400:
              $ref: '#/components/responses/BadRequestImage'
            401:
              $ref: '#/components/responses/Unauthorized'
            402:
              $ref: '#/components/responses/PaymentRequired'
            403:
              $ref: '#/components/responses/Forbidden'
            412:
              $ref: '#/components/responses/PreconditionFailed'
            413:
              $ref: '#/components/responses/RequestEntityTooLarge'
            415:
              $ref: '#/components/responses/UnsupportedMediaType'
            422:
              $ref: '#/components/responses/UnprocessableEntity'
            429:
              $ref: '#/components/responses/TooManyRequests'
            500:
              $ref: '#/components/responses/InternalServerError'
    
      /status:
        get:
          tags:
            - Status
          summary: Get All Statuses
          operationId: getAllStatuses
          description: |
            Retrieve the status of all image enhancement jobs.
          responses:
            200:
              description: Array of statuses of all processes
              content:
                application/json:
                  schema:
                    type: array
                    items:
                      $ref: '#/components/schemas/StatusResponse'
            401:
              $ref: '#/components/responses/Unauthorized'
            403:
              $ref: '#/components/responses/Forbidden'
            429:
              $ref: '#/components/responses/TooManyRequests'
            500:
              $ref: '#/components/responses/InternalServerError'
    
      /status/{process_id}:
        get:
          tags:
            - Status
          summary: Get Status
          operationId: getStatus
          description: |
            Use this endpoint to retrieve status information for your image enhance jobs.
          parameters:
            - name: process_id
              in: path
              required: true
              description: The UUID of the image enhancement job.
              schema:
                type: string
                format: uuid
          responses:
            200:
              description: Status of the process
              content:
                application/json:
                  schema:
                    $ref: '#/components/schemas/StatusResponse'
            400:
              $ref: '#/components/responses/BadRequestProcess'
            401:
              $ref: '#/components/responses/Unauthorized'
            403:
              $ref: '#/components/responses/Forbidden'
            404:
              $ref: '#/components/responses/NotFound'
            429:
              $ref: '#/components/responses/TooManyRequests'
            500:
              $ref: '#/components/responses/InternalServerError'
        delete:
          tags:
            - Status
          summary: Delete Status
          operationId: deleteStatus
          description: |
            Remove an image enhancement job status by its `process_id`. This operation can be used to delete the statuses of finished jobs, cleaning up the response of `GET Status`, for example.
          parameters:
            - name: process_id
              in: path
              required: true
              description: The UUID of the image enhancement job.
              schema:
                type: string
                format: uuid
          responses:
            204:
              description: The image enhancement job status was successfully deleted. No content returned.
            400:
              $ref: '#/components/responses/BadRequestProcess'
            401:
              $ref: '#/components/responses/Unauthorized'
            403:
              $ref: '#/components/responses/Forbidden'
            404:
              $ref: '#/components/responses/NotFound'
            409:
              $ref: '#/components/responses/Conflict'
            429:
              $ref: '#/components/responses/TooManyRequests'
            500:
              $ref: '#/components/responses/InternalServerError'
      
      /download/{process_id}:
        get:
          tags:
            - Download
          summary: Download
          operationId: getDownload
          description: |
            A presigned download link to the image is provided in the response, as well as an expiration time (in Unix time). New download links can be generated up to **24 hours** after the image has been processed.
          parameters:
            - name: process_id
              in: path
              required: true
              description: The UUID of the image enhancement job.
              schema:
                type: string
                format: uuid
          responses:
            200:
              description: Presigned download URL
              content:
                application/json:
                  schema:
                    $ref: '#/components/schemas/DownloadResponse'
            400:
              $ref: '#/components/responses/BadRequestProcess'
            401:
              $ref: '#/components/responses/Unauthorized'
            403:
              $ref: '#/components/responses/Forbidden'
            404:
              $ref: '#/components/responses/NotFound'
            429:
              $ref: '#/components/responses/TooManyRequests'
            500:
              $ref: '#/components/responses/InternalServerError'
    
      /estimate:
        post:
          tags:
            - Estimate
          summary: Estimate
          operationId: postEstimate
          description: |
            Returns the estimated time taken to complete a given processing job and the credits that would be consumed for that job.
          requestBody:
            content:
              multipart/form-data:
                schema:
                  $ref: '#/components/schemas/EstimateImageTaskRequest'
          responses:
            200:
              description: The estimated time taken in seconds and the credits that would be consumed on process.
              content:
                application/json:
                  schema:
                    $ref: '#/components/schemas/EstimationResponse'
            400:
              $ref: '#/components/responses/BadRequestEstimate'
            401:
              $ref: '#/components/responses/Unauthorized'
            403:
              $ref: '#/components/responses/Forbidden'
            429:
              $ref: '#/components/responses/TooManyRequests'
            500:
              $ref: '#/components/responses/InternalServerError'
    
      /estimate-gen:
        post:
          tags:
            - Estimate
          summary: Estimate Generative
          operationId: postEstimateGen
          description: |
            Returns the estimated time taken to complete a given processing job and the credits that would be charged.
          requestBody:
            content:
              multipart/form-data:
                schema:
                  $ref: '#/components/schemas/EstimateImageTaskGenRequest'
          responses:
            200:
              description: The estimated time taken in seconds.
              content:
                application/json:
                  schema:
                    $ref: '#/components/schemas/EstimationResponse'
            400:
              $ref: '#/components/responses/BadRequestEstimate'
            401:
              $ref: '#/components/responses/Unauthorized'
            403:
              $ref: '#/components/responses/Forbidden'
            429:
              $ref: '#/components/responses/TooManyRequests'
            500:
              $ref: '#/components/responses/InternalServerError'
    
      /cancel/{process_id}:
        delete:
          tags:
            - Cancel
          summary: Cancel
          operationId: cancelEnhance
          description: |
            Cancel a pending image enhancement job. If the job has already completed, or if it is not in a cancellable state, this request will fail with a conflict error. Use this to prevent unnecessary costs for jobs started in error.
          parameters:
            - name: process_id
              in: path
              required: true
              description: The UUID of the image enhancement job.
              schema:
                type: string
                format: uuid
          responses:
            204:
              description: The image enhancement job was successfully cancelled. No content returned.
            400:
              $ref: '#/components/responses/BadRequestProcess'
            401:
              $ref: '#/components/responses/Unauthorized'
            403:
              $ref: '#/components/responses/Forbidden'
            404:
              $ref: '#/components/responses/NotFound'
            409:
              $ref: '#/components/responses/Conflict'
            429:
              $ref: '#/components/responses/TooManyRequests'
            500:
              $ref: '#/components/responses/InternalServerError'
    
    components:
      schemas:
        ProcessRequest:
          type: object
          properties:
            output_height:
              type: integer
              description: The desired height of the output image in pixels. If only one of `output_height` and `output_width` is set, then the other dimension is scaled proportionally.
              minimum: 1
              maximum: 32000
              example: 1080
            output_width:
              type: integer
              description: The desired width of the output image in pixels. If only one of `output_height` and `output_width` is set, then the other dimension is scaled proportionally.
              minimum: 1
              maximum: 32000
              example: 1920
            output_format:
              type: string
              description: The desired format of the output image.
              enum:
                - jpeg
                - jpg
                - png
                - tiff
                - tif
              example: jpeg
            crop_to_fill:
              type: boolean
              description: Default behavior is to letterbox the image if a differing aspect ratio is chosen. Enable `crop_to_fill` by setting this to `true` if you instead want to crop the image to fill the dimensions.
              example: false
            face_enhancement:
              type: boolean
              description: By default, faces (if any) are enhanced during image enhancement as well. Set `face_enhancement` to `false` if you don't want this.
              example: true
            face_enhancement_creativity:
              type: number
              description: Choose the level of creativity for face enhancement from 0 to 1. Defaults to `0`, and is ignored if `face_enhancement` is `false`.
              minimum: 0
              maximum: 1
              example: 0
          additionalProperties:
            type: string
            description: Additional key-value pairs to be used as model settings. Only pairs relevant for your chosen model are used. Please see the [available models](#available-models) for more details.
            example:
              creativity: "3"
    
        EnhanceGenRequest:
          allOf:
            - $ref: '#/components/schemas/ProcessRequest'
          required:
            - image
          properties:
            image:
              type: string
              format: binary
              description: |
                The image file to be enhanced. Supported formats:
                  - jpeg (or jpg)
                  - png
                  - tiff (or tif)
            model:
              type: string
              description: The model to use for processing the image.
              enum:
                - Recovery
                - Redefine
              example: Redefine
    
        EnhanceRequest:
          allOf:
            - $ref: '#/components/schemas/ProcessRequest'
          required:
            - image
          properties:
            image:
              type: string
              format: binary
              description: |
                The image file to be enhanced. Supported formats:
                  - jpeg (or jpg)
                  - png
                  - tiff (or tif)
            model:
              type: string
              description: The model to use for processing the image.
              enum:
                - Standard V2
                - Low Resolution V2
                - CGI
                - High Fidelity V2
                - Text Refine
              example: Standard V2
    
        EstimateImageTaskRequest:
          allOf:
            - $ref: '#/components/schemas/ProcessRequest'
          required:
            - input_height
            - input_width
          properties:
            model:
              type: string
              description: The model to use for processing the image.
              enum:
                - Standard V2
                - Low Resolution V2
                - CGI
                - High Fidelity V2
                - Text Refine
              example: Standard V2
            input_height:
              type: integer
              description: The height of the input image in pixels.
              minimum: 1
              maximum: 32000
              example: 1080
            input_width:
              type: integer
              description: The width of the input image in pixels.
              minimum: 1
              maximum: 32000
              example: 1920
    
        EstimateImageTaskGenRequest:
          allOf:
            - $ref: '#/components/schemas/ProcessRequest'
          required:
            - input_height
            - input_width
          properties:
            model:
              type: string
              description: The model to use for processing the image.
              enum:
                - Recovery
                - Redefine
              example: Redefine
            input_height:
              type: integer
              description: The height of the input image in pixels.
              minimum: 1
              maximum: 32000
              example: 1080
            input_width:
              type: integer
              description: The width of the input image in pixels.
              minimum: 1
              maximum: 32000
              example: 1920
    
        SyncResponse:
          type: string
          format: binary
    
        AsyncResponse:
          type: object
          required:
            - process_id
            - eta
          properties:
            process_id:
              type: string
              description: Unique identifier of the image enhancement job.
              example: d7b3b3b3-7b3b-4b3b-8b3b-3b3b3b3b3b3b
            eta:
              type: integer
              description: Estimated time of arrival (ETA) for the process to complete in Unix time.
              example: 1617220000
    
        StatusResponse:
          type: object
          required:
            - process_id
            - filename
            - input_format
            - input_height
            - input_width
            - output_format
            - output_height
            - output_width
            - model
            - face_enhancement
            - crop_to_fill
            - sync
            - status
            - progress
            - eta
            - creation_time
            - modification_time
            - credits
          properties:
            process_id:
              type: string
              description: Unique identifier of the image enhancement job.
              example: d7b3b3b3-7b3b-4b3b-8b3b-3b3b3b3b3b3b
            filename:
              type: string
              description: Name of the file being processed.
              example: image.png
            input_format:
              type: string
              description: Format of the input file.
              example: png
            input_height:
              type: integer
              description: Height of the input image in pixels.
              example: 720
            input_width:
              type: integer
              description: Width of the input image in pixels.
              example: 1280
            output_format:
              type: string
              description: Format of the output file.
              example: jpeg
            output_height:
              type: integer
              description: Height of the output image in pixels.
              example: 1080
            output_width:
              type: integer
              description: Width of the output image in pixels.
              example: 1920
            model:
              type: string
              description: Model used for processing.
              example: Standard V2
            face_enhancement:
              type: boolean
              description: Whether face enhancement is enabled.
              example: true
            crop_to_fill:
              type: boolean
              description: Whether cropping to fill is enabled.
              example: false
            options_json:
              type: string
              description: Additional options in JSON format.
              example: {"creativity": 90}
            sync:
              type: boolean
              description: Whether the process is synchronous.
              example: false
            status:
              type: string
              description: Status of the job.
              enum:
                - Pending
                - Processing
                - Completed
                - Cancelled
                - Failed
              example: Completed
            progress:
              type: integer
              description: Progress of the job as a percentage. Useful for displaying a progress bar or loading spinners etc.
              minimum: 0
              maximum: 100
              example: 100
            eta:
              type: integer
              description: Estimated time of arrival (ETA) for the process to complete in Unix time.
              example: 1617220000
            creation_time:
              type: integer
              description: Creation time of the job in Unix epoch format.
              example: 1633024800
            modification_time:
              type: integer
              description: Last modification time of the job in Unix epoch format.
              example: 1633038400
            credits:
              type: integer
              description: Credits (to be) consumed on image enhancement completion.
              example: 2
    
        DownloadResponse:
          type: object
          required:
            - head_url
            - download_url
            - expiry
          properties:
            download_url:
              type: string
              description: The presigned URL for downloading the enhanced image. This URL is temporary and will **expire after 1 hour**.
              example: https://<...>/d7b3b3b3-7b3b-4b3b-8b3b-3b3b3b3b3b3b?<presigned_headers>
            head_url:
              type: string
              description: The presigned URL for fetching the metadata of the enhanced image's file. Useful for retrieving the resulting image's size before download. This URL is temporary and will **expire after 1 hour**.
              example: https://<...>/d7b3b3b3-7b3b-4b3b-8b3b-3b3b3b3b3b3b?<presigned_headers>
            expiry:
              type: integer
              description: The expiration time (in Unix epoch) of the presigned download link, set as 1 hour after download link generation. After this time, the link will no longer be valid.
              example: 1617220000
    
        EstimationResponse:
          type: object
          required:
            - duration
          properties:
            duration:
              type: integer
              description: The estimated time taken in seconds for the image to be enhanced with the given parameters.
              minimum: 0
              example: 30
            credits:
              type: integer
              description: The number of credits that would be consumed if the given requests was executed.
              minimum: 1
              example: 2
    
        Error:
          type: object
          required:
            - message
          properties:
            code:
              type: integer
              description: The HTTP status code.
            message:
              type: string
              description: A human readable error message.
    
      responses:
        BadRequestImage:
          description: The request contains malformed data in the body, path, or query parameters.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
              examples:
                badRequestImageExample:
                  summary: The `output_height` of the enhance request is invalid.
                  value:
                    code: 400
                    message: Invalid output height.
    
        BadRequestProcess:
          description: The request contains malformed data in the body, path, or query parameters.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
              examples:
                badRequestProcessExample:
                  summary: An invalid `process_id` was provided.
                  value:
                    code: 400
                    message: Invalid process ID. Please ensure it is a valid UUID.
    
        BadRequestEstimate:
          description: The request contains malformed data in the body, path, or query parameters.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
              examples:
                badRequestProcessExample:
                  summary: An invalid `input_height` was provided.
                  value:
                    code: 400
                    message: Please provide a valid input resolution.
    
        Unauthorized:
          description: Authentication is required and has failed or has not yet been provided.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
              examples:
                unauthorizedExample:
                  summary: The API key provided is invalid or expired.
                  value:
                    code: 401
                    message: Unauthorized
    
        PaymentRequired:
          description: Payment is required to access the resource.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
              examples:
                paymentRequiredExample:
                  summary: The account does not have sufficient funds to process the request.
                  value:
                    code: 402
                    message: Insufficient funds.
        Forbidden:
          description: The API key doesn’t have permissions to perform the request.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
              examples:
                forbiddenExample:
                  summary: The provided token does not have access to the endpoint.
                  value:
                    code: 403
                    message: Forbidden
    
        NotFound:
          description: The requested resource does not exist.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
              examples:
                notFoundExample:
                  summary: The requested image enhancement job could not be found.
                  value:
                    code: 404
                    message: An image with the given process ID was not found.
    
        Conflict:
          description: The reqeust conflicts with the current state.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
              examples:
                conflictExample:
                  summary: The requested image enhancement job is not in a cancellable state.
                  value:
                    code: 409
                    message: The process cannot be cancelled as it is not in a cancellable state.
    
        PreconditionFailed:
          description: The preconditions to process the request were not met.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
              examples:
                preconditionFailedExample:
                  summary: No valid API subscription exists for this request.
                  value:
                    code: 412
                    message: Precondition Failed
    
        RequestEntityTooLarge:
          description: The request is larger than the server is willing or able to process.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
              examples:
                requestEntityTooLargeExample:
                  summary: The image file uploaded exceeds the maximum allowed size.
                  value:
                    code: 413
                    message: Request Entity Too Large
    
        UnsupportedMediaType:
          description: The request entity has a media type which the server or resource does not support.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
              examples:
                unsupportedMediaTypeExample:
                  summary: The image file uploaded is in an unsupported format.
                  value:
                    code: 415
                    message: Image could not be decoded to a supported image type.
    
        UnprocessableEntity:
          description: The request was well-formed but was unable to be followed due to semantic errors.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
              examples:
                unprocessableEntityExample:
                  summary: Image has invalid dimensions (width or height is zero).
                  value:
                    code: 422
                    message: Image has invalid dimensions (width or height is zero).
    
        TooManyRequests:
          description: Too many requests hit the API too quickly. A backoff (e.g. exponential) is recommended for your requests.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
              examples:
                tooManyRequestsExample:
                  summary: The rate limit for requests has been exceeded.
                  value:
                    code: 429
                    message: Too Many Requests
    
        InternalServerError:
          description: Unexpected error on our end.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
              examples:
                internalServerErrorExample:
                  summary: The server encountered an unexpected condition.
                  value:
                    code: 500
                    message: An internal server error occurred. Please try again later. If the problem persists, please contact support.
      
    
      securitySchemes:
        apiKeyAuth:
          type: apiKey
          in: header
          name: X-API-Key
          description: |
            Authentication via the Topaz generated key in the `X-API-Key` header.
    
    
    security:
      - apiKeyAuth: []

AUTHORIZATIONAPI Key

Key

X-API-Key

Value

{{apiKey}}