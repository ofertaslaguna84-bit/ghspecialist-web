/**
 * Preview del panel — tu tema manda; keywords e indexación por región abajo.
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
        indexingKeywords: null,
      };
    }
    return {
      exact: true,
      resolvedPhrase: t,
      message:
        'Artículo sobre tu tema. Abajo: búsquedas que indexamos (México, Torreón, Monterrey).',
      suggestions: [],
      willExpandContent: false,
      indexingKeywords: null,
      indexingLoading: true,
    };
  }

  function fetchPreview(input) {
    var base = previewTopicInput(input);
    var t = (input || '').trim();
    if (!t || !global.GH_BlogIndexing) {
      base.indexingLoading = false;
      return Promise.resolve(base);
    }
    return global.GH_BlogIndexing.fetchIndexingPreview(t)
      .then(function (idx) {
        base.indexingKeywords = idx;
        base.indexingLoading = false;
        return base;
      })
      .catch(function () {
        base.indexingLoading = false;
        base.indexingKeywords = {
          intro: 'Al publicar verás las búsquedas por México, Torreón y Monterrey.',
          enArticulo: [],
          regions: [],
        };
        return base;
      });
  }

  global.GH_BlogTopic = {
    previewTopicInput: previewTopicInput,
    fetchPreview: fetchPreview,
  };
})(typeof window !== 'undefined' ? window : globalThis);
