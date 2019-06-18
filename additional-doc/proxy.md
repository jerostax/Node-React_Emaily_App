# Proxy

## Dev Mode

- When we send a request from one server to another, the browser thinks it's malicious so we make use of a Proxy to handle this issue
- The proxy is going to see that their is a request and copy it to send it to the other server while the initial request is pending (from localhost:3000 to localhost:5000 in our case, but the browser / create-react-app server never knows that we send back the request to another route/server/port - in our case to our Express API)
- Now the express API has the request so it's gonna send back to the pending request that we have to go to the google.com authentification and return to the "/auth/google/callback" UIR when the authentification is done
- Now the proxy recieve a new request because we redirect to "/auth/google/callback", it's gonna go through the same process, copy the request (initial one is pending), send it to the Express API (at that moment the express API deal with the users details and knows that we need to redirect back to "/" with the cookie so it send this instructions to the pending request)

## Prod Mode

- In the prod mode we don't need that proxy because we don't have the create-react-app server anymore so the request is gonna be send to the Express API directly and do the job
