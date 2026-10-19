# Submission Guide (steps only you can do)

## 1. Run locally
```bash
npm install        # creates node_modules and package-lock.json
npm start          # "Server is running on port 3000"
```
Open http://localhost:3000 – you should see the status message.

## 2. Test in Postman
1. Postman → Import → `postman/Books-API.postman_collection.json`.
2. Run requests one by one (or Collection Runner). Take screenshots of: a successful GET, POST (201), PUT/PATCH, DELETE, and several `[FAIL]` requests (404, 400).
3. Export the collection if your instructor asks.

## 3. Push to GitHub
Create an empty repo on github.com first, then:
```bash
git init
git add .
git commit -m "Build RESTful API with Express.js"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```
Check that `node_modules/` is NOT in the repo and `package-lock.json` IS.

## 4. Deploy on Render
1. render.com → New → Web Service → connect GitHub → select the repo.
2. Runtime: Node. Build command: `npm install`. Start command: `npm start`.
3. Instance type: Free. Click Create Web Service and watch the logs until it says "Your service is live".
4. Open the `https://....onrender.com` URL; the root route should return the status message.
5. Change Postman's `baseUrl` variable to the Render URL and run at least one CRUD request; screenshot it.

## 5. Finish
Replace the two placeholder URLs in `README.md`, commit and push again:
```bash
git add README.md
git commit -m "Add GitHub and Render URLs to README"
git push
```
Submit: GitHub URL, Render URL, Postman screenshots (and collection if asked).

## Checklist
- [ ] Server starts locally
- [ ] 7 endpoints work (5 required + PATCH + root)
- [ ] Postman success AND failure screenshots
- [ ] Repo on GitHub, node_modules excluded
- [ ] Render deployment live
- [ ] README has both URLs
