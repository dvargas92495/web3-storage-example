# Minimal Repo Showing Performance Issue with Web3 Storage Put `wrapWithDirectory: false`

Steps to Reproduce:
1. Clone Repo
1. `npm install`
1. Create a `.env` file with `WEB3STORAGE_TOKEN=[paste-your-token-here]`
1. `npm t`

Expected Behavior:
- First download time would be on par with the second and third download time
- Bonus: Download speeds would be ~100ms, on par with S3

Actual Behavior:
- First download time is often 10x worse then the second and third time
- Bonus: all download times are >500ms.
