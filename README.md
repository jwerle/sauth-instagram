sauth-instagram
===============

Instagram [sauth](https://github.com/jwerle/sauth) strategy

## install

```sh
$ npm i sauth-instagram
```

## usage

Command line arguments:

```sh
$ sauth instagram \
  --client-id=CLIENT_ID \
  --client-secret=CLIENT_SECRET
  --redirect-uri=REDIRECT_URI \
  --port=SERVER_PORT
```
JSON configuration:

```sh
$ sauth instagram -c conf.json
```

**conf.json**

```json
{
  "client_id": "CLIENT_ID",
  "client_secret": "CLIENT_SECRET",
  "redirect_uri": "REDIRECT_URI",
  "port": 9999
}
```

## license

MIT

