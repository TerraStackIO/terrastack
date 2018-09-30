const { Provider } = require("terrastack");

const provider = new Provider({
  provider: [
    {
      aws: {
        region: process.env.AWS_DEFAULT_REGION
      }
    }
  ]
});

module.exports = provider;
