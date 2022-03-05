module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          firefox: 57
        }
      }
    ],
    "@babel/preset-react"
  ],
  plugins: ["@babel/plugin-proposal-nullish-coalescing-operator", "@babel/plugin-proposal-optional-chaining", "@babel/plugin-syntax-optional-chaining", "@babel/plugin-proposal-object-rest-spread", "transform-class-properties"]
};
