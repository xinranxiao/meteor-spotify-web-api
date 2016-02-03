ServiceConfiguration.configurations.update(
    { "service": "spotify" },
    {
      $set: {
        "clientId": "<your client id>",
        "secret": "<your secret key>"
      }
    },
    { upsert: true }
);

