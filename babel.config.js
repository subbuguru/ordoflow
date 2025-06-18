module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // ADDED: This plugins array with 'react-native-reanimated/plugin' is CRITICAL.
    plugins: [
      'react-native-reanimated/plugin',
    ],
  };
};