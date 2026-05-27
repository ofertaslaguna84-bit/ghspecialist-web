/**
 * Preview del panel — el artículo usa TU tema; Google Suggest solo aporta keywords en el texto.
 */
(function (global) {
  function previewTopicInput(userInput) {
    var t = (userInput || '').trim();
    if (!t) {
      return {
        exact: true,
        resolvedPhrase: '',
        message:
          'Vacío = el sistema elige el siguiente tema del catálogo. Si escribes algo, el post es sobre ESO.',
        suggestions: [],
        willExpandContent: false,
      };
    }
    return {
      exact: true,
      resolvedPhrase: t,
      message:
        'Artículo sobre tu tema. Al publicar, la IA integra 2–5 frases que la gente busca en Google México (sin cambiar de qué trata el post).',
      suggestions: [],
      willExpandContent: false,
    };
  }

  global.GH_BlogTopic = {
    previewTopicInput: previewTopicInput,
    fetchPreview: function (input) {
      return Promise.resolve(previewTopicInput(input));
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
