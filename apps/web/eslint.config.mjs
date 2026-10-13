// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt({
  rules: {
    // formátovanie rieši Prettier (<br />)
    'vue/html-self-closing': 'off',
    // voliteľné props v TypeScripte nepotrebujú default
    'vue/require-default-prop': 'off',
  },
});
