ServiceConfiguration.configurations.update(
    { "service": "spotify" },
    {
      $set: {
        "clientId": "6008c94f99884ff49576f4e763f19d58",
        "secret": "42ffdf7297b148e79588274548fac0be"
      }
    },
    { upsert: true }
);

