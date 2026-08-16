/**
 * Articulos escritos a mano sobre reclutamiento y operacion en obra.
 *
 * Estos NO los genera la IA: salen de trabajo real con un desarrollador de
 * vivienda. Por eso son los unicos que la competencia no puede copiar -- una
 * agencia de marketing puede escribir "5 beneficios de un chatbot", pero no
 * puede contar por que 466 candidatos se quedaron parados esperando llamada.
 *
 * SIN NOMBRES DE CLIENTE, a proposito: se describe el caso por su tamaño y su
 * problema, nunca por quien es. Tampoco se menciona la ciudad junto a la cifra,
 * porque en un gremio chico eso identifica igual que el nombre.
 */

export const ARTICULOS_OBRA = [
  {
    slug: 'cuello-de-botella-reclutamiento-obra',
    title: 'Por qué te faltan albañiles si tienes 4,000 candidatos',
    h1: 'Por qué te faltan albañiles si tienes 4,000 candidatos',
    description:
      'El problema de mano de obra en construcción casi nunca es de captación: es que nadie devuelve la llamada. Qué encontramos al auditar un embudo real de reclutamiento.',
    ogTitle: 'Por qué te faltan albañiles si tienes 4,000 candidatos',
    ogDescription:
      'El cuello de botella del reclutamiento en obra no es conseguir gente. Es que alguien marque.',
    categoria: 'Reclutamiento en obra',
    readTime: 5,
    contenido: `
<p>Si tu constructora no encuentra fierreros, cimbreros o albañiles, lo más probable es que el problema no sea de captación. Es de seguimiento.</p>

<p>Lo digo porque lo medimos. En un desarrollo de vivienda con más de 15,000 casas construidas, el embudo de reclutamiento tenía <strong>más de 4,000 candidatos registrados</strong>. Gente que había levantado la mano, dejado su teléfono y dicho a qué se dedicaba.</p>

<p>Y aun así faltaba personal en obra.</p>

<h2>Los números que nadie estaba viendo</h2>

<p>Al abrir el embudo, esto era lo que había:</p>

<ul>
  <li><strong>1,034 candidatos</strong> sin procesar, parados en la entrada</li>
  <li><strong>466</strong> ya calificados y agendados, esperando que alguien les llamara</li>
  <li><strong>3,280</strong> sin ninguna tarea asignada — es decir, sin nadie responsable de contactarlos</li>
  <li><strong>Cero</strong> aprobados para contratar</li>
</ul>

<p>En una muestra de 430 candidatos, solo 37 estaban marcados como contactados. <strong>Un 8.6%.</strong></p>

<p>Nueve de cada diez personas que levantaron la mano para trabajar nunca recibieron una llamada.</p>

<h2>El filtro funcionaba. El teléfono no.</h2>

<p>Lo interesante es que la parte automática sí servía. Un asistente hacía las preguntas correctas: a qué te dedicas, traes cuadrilla, de cuántos, tienes herramienta, de dónde eres. Calificaba bien y agendaba la cita.</p>

<p>El proceso se caía justo después. El candidato quedaba listo, con su cita puesta… y ahí se quedaba, porque no había nadie con la instrucción clara de llamarle ese día.</p>

<p>Es el error más caro y más común en reclutamiento de obra: se invierte en atraer gente y se descuida el tramo de treinta segundos donde alguien tiene que marcar.</p>

<h2>Lo que un candidato de obra no te perdona</h2>

<p>Un fierrero con cuadrilla no espera. Si levantó la mano contigo el lunes y nadie le habló, el miércoles ya está en otra obra. No es deslealtad: tiene que comer y traer gente que también come.</p>

<p>Cada día que un candidato calificado pasa sin recibir llamada, su probabilidad de contratación se desploma. No porque pierda interés en el trabajo, sino porque encuentra otro.</p>

<h2>Cómo se arregla sin contratar más reclutadores</h2>

<p>La solución no fue conseguir más candidatos, sino repartir mejor los que ya había:</p>

<ul>
  <li><strong>Reparto automático cada mañana.</strong> Los candidatos que quedaron listos se dividen en partes iguales entre los reclutadores del equipo.</li>
  <li><strong>Cada quien recibe su lista</strong>, con el contexto ya resuelto: oficio, si trae cuadrilla y de cuántos, si tiene herramienta y de dónde es.</li>
  <li><strong>El sistema marca al candidato como asignado</strong> en el mismo movimiento. Si el sistema es el único que puede mover a alguien de "listo" a "asignado", es imposible que dos reclutadores llamen a la misma persona.</li>
  <li><strong>Un reporte diario</strong> dice cuántos se repartieron y a quién le tocaron.</li>
</ul>

<p>Nada de esto es tecnología complicada. Es quitarle a un humano la decisión de a quién le toca qué, que es justo donde se atoraba.</p>

<h2>Antes de invertir en más publicidad</h2>

<p>Si te falta gente en obra, revisa esto antes de gastar un peso más en atraer candidatos:</p>

<ul>
  <li>¿Cuántos candidatos tienes registrados que nunca recibieron una llamada?</li>
  <li>¿Cuánto tarda alguien en marcarle a quien se registró ayer?</li>
  <li>¿Puedes decir hoy quién es el responsable de llamarle a cada uno?</li>
  <li>Si dos reclutadores marcan al mismo señor, ¿te enteras?</li>
</ul>

<p>Si alguna respuesta es "no sé", el problema no es de captación. Y meterle más presupuesto a la publicidad solo va a hacer más grande la lista de gente a la que nadie le habla.</p>
`,
    relacionados: [
      { slug: 'repartir-candidatos-obra-sin-duplicar.html', titulo: 'Cómo repartir candidatos entre reclutadores sin duplicar llamadas', desc: 'El movimiento de etapa como candado, no la libreta.' },
      { slug: 'que-datos-pedirle-a-un-destajista.html', titulo: 'Los 5 datos que necesitas de un destajista antes de llamarle', desc: 'Oficio, cuadrilla, herramienta, ciudad y nombre real.' },
    ],
  },

  {
    slug: 'repartir-candidatos-obra-sin-duplicar',
    title: 'Cómo repartir candidatos de obra sin duplicar llamadas',
    h1: 'Cómo repartir candidatos de obra sin duplicar llamadas',
    description:
      'Repartir candidatos por WhatsApp o en una hoja compartida siempre acaba en llamadas repetidas. La regla que lo vuelve imposible, explicada con un caso real de obra.',
    ogTitle: 'Cómo repartir candidatos de obra sin duplicar llamadas',
    ogDescription:
      'La regla simple que hace imposible que dos reclutadores marquen al mismo señor.',
    categoria: 'Reclutamiento en obra',
    readTime: 5,
    contenido: `
<p>Cuando tienes siete reclutadores y una lista de candidatos, el problema deja de ser conseguir gente y pasa a ser repartirla. Y casi siempre se reparte mal.</p>

<p>El método de la mayoría de las constructoras: alguien copia nombres en un Excel, lo manda por WhatsApp, y cada reclutador agarra de ahí. Dos semanas después, un candidato ya recibió tres llamadas del mismo desarrollo y otros doscientos no recibieron ninguna.</p>

<h2>Por qué falla la hoja compartida</h2>

<p>Porque el control depende de que todos anoten lo que hicieron, en el momento en que lo hicieron. Y eso no pasa. El reclutador está manejando, está en obra, marca y se le olvida palomear. La hoja miente en cuanto alguien no la actualiza.</p>

<p>Con etiquetas de colores pasa igual. Con listas por reclutador, igual. Cualquier sistema donde <em>una persona</em> tenga que registrar que ya hizo algo va a fallar el día que ande ocupada.</p>

<h2>La regla que sí funciona</h2>

<p>El reparto tiene que dejar rastro por sí mismo, sin que nadie anote nada. Y la forma más limpia es esta:</p>

<p><strong>Que el sistema sea el único que puede mover a un candidato de "listo para llamar" a "asignado".</strong></p>

<p>Si esa es la única puerta, entonces:</p>

<ul>
  <li>Un candidato asignado ya no aparece en la lista del día siguiente</li>
  <li>Dos reclutadores no pueden recibir al mismo, porque en cuanto se asigna, sale de la bolsa</li>
  <li>Nadie tiene que acordarse de palomear nada</li>
</ul>

<p>El movimiento <em>es</em> la marca. No hay un segundo registro que pueda contradecirlo.</p>

<h2>El orden importa: primero avisar, luego mover</h2>

<p>Aquí hay un detalle que decide si el sistema es confiable o un dolor de cabeza.</p>

<p>Si mueves al candidato de etapa y <em>luego</em> mandas el aviso al reclutador, y el aviso falla, ese candidato queda en el limbo: marcado como asignado, pero nadie sabe que le tocaba. Nunca recibe llamada y no aparece en ninguna lista.</p>

<p>Al revés es mejor. <strong>Primero confirmas que el reclutador recibió su lista, y solo entonces mueves.</strong> Si el envío falla, esos candidatos se quedan donde estaban y mañana se reparten otra vez.</p>

<p>Es preferible que alguien reciba su lista dos días seguidos a que un candidato se pierda para siempre. Quedarse corto se corrige; perder gente, no.</p>

<h2>Reparto parejo, no por bloques</h2>

<p>Otra cosa que vale la pena cuidar: repartir por turnos rotativos y no en bloques.</p>

<p>Si le das los primeros 50 al reclutador A y los siguientes 50 al B, y resulta que los primeros llegaron de una campaña buena y los últimos de una mala, castigaste al B sin querer. Con turno rotativo — uno a cada quien, y vuelta a empezar — la calidad se reparte pareja.</p>

<p>Y el turno debe guardarse entre repartos. Si cada mañana empieza desde el primer reclutador, esa persona siempre recibe más que la última.</p>

<h2>Qué debe llegarle al reclutador</h2>

<p>Una lista de teléfonos no sirve. El reclutador necesita saber a quién le está marcando antes de marcar:</p>

<ul>
  <li>Nombre real de la persona</li>
  <li>Teléfono, listo para marcar</li>
  <li>Oficio: fierrero, cimbrero, albañil, yesero, pisero</li>
  <li>Si trae cuadrilla y de cuántos</li>
  <li>Si tiene herramienta</li>
  <li>De dónde es</li>
</ul>

<p>Con eso, la llamada empieza en "¿Cómo está, don Juan? Vi que es plomero y que trae cuadrilla de cuatro" en vez de en "¿Bueno? ¿Con quién hablo?". La diferencia en resultado es enorme, y el dato ya lo tenías: nada más estaba enterrado en la conversación.</p>
`,
    relacionados: [
      { slug: 'cuello-de-botella-reclutamiento-obra.html', titulo: 'Por qué te faltan albañiles si tienes 4,000 candidatos', desc: 'El cuello de botella no es captar. Es llamar.' },
      { slug: 'que-datos-pedirle-a-un-destajista.html', titulo: 'Los 5 datos que necesitas de un destajista antes de llamarle', desc: 'Qué preguntar y en qué orden.' },
    ],
  },

  {
    slug: 'que-datos-pedirle-a-un-destajista',
    title: 'Los 5 datos que necesitas de un destajista antes de llamarle',
    h1: 'Los 5 datos que necesitas de un destajista antes de llamarle',
    description:
      'Oficio, cuadrilla, herramienta, ciudad y nombre real. Por qué estos cinco deciden si la llamada sirve, y cómo capturarlos sin que el candidato se aburra.',
    ogTitle: 'Los 5 datos que necesitas de un destajista antes de llamarle',
    ogDescription:
      'Qué preguntarle a un candidato de obra, en qué orden, y por qué el nombre importa más de lo que parece.',
    categoria: 'Reclutamiento en obra',
    readTime: 4,
    contenido: `
<p>Un reclutador que marca sin contexto quema la llamada y quema al candidato. Estos son los cinco datos que cambian una llamada a ciegas por una conversación que avanza.</p>

<h2>1. Oficio</h2>

<p>Fierrero, cimbrero, albañil, moldero, yesero, pisero, pintor, detallista. No "trabajador de la construcción": el oficio exacto.</p>

<p>Es el que decide todo lo demás. Si hoy necesitas cimbra y el señor es pintor, la llamada sobra por más ganas que le eches. Y si tienes el oficio capturado, puedes llamar primero a los quince que sí encajan con el frente que traes atrasado.</p>

<h2>2. Si trae cuadrilla, y de cuántos</h2>

<p>Este es el que más se ignora y el que más vale.</p>

<p>Un maestro con cuadrilla de seis no es "un candidato": son siete personas y un frente completo que puedes abrir el lunes. Cuesta lo mismo llamarle a él que a alguien que va solo, pero el resultado no se parece.</p>

<p>Si vas atrasado en obra, tu lista debería estar ordenada por tamaño de cuadrilla, no por fecha de registro.</p>

<h2>3. Si tiene herramienta</h2>

<p>Cambia el arranque y cambia el costo. Alguien que llega con su equipo empieza mañana; alguien que no, hay que resolverle antes de que pise la obra.</p>

<p>Ninguna de las dos respuestas descalifica. Pero saberlo antes de colgar evita la sorpresa del primer día, que es donde se cae la contratación.</p>

<h2>4. De dónde es</h2>

<p>Define si es local o foráneo, y eso define si hay que hablar de hospedaje y traslado.</p>

<p>Un foráneo dispuesto a moverse puede ser tu mejor contratación, pero es otra conversación — y otra llamada, con otra persona. Mejor saberlo antes.</p>

<h2>5. Su nombre real</h2>

<p>Suena obvio y casi nunca está.</p>

<p>Los sistemas de captación guardan al candidato como "Contacto 8711234567" o con lo que traiga el perfil de WhatsApp, que a veces es un apodo o el nombre de un negocio. El reclutador acaba abriendo con "¿Bueno? ¿Con quién hablo?", que es la peor forma de empezar.</p>

<p>"Buenas tardes, ¿hablo con don Ramón?" cambia la llamada entera. Es el dato más barato de capturar y el que más se nota.</p>

<h2>Cómo capturarlos sin perder al candidato</h2>

<p>La tentación es mandar un formulario con diez campos. No funciona: la gente de obra contesta por WhatsApp, entre chamba y chamba, y un formulario largo se abandona.</p>

<p>Lo que sí funciona:</p>

<ul>
  <li><strong>Una pregunta a la vez</strong>, en el chat donde ya está la persona.</li>
  <li><strong>Guardar cada respuesta en cuanto llega</strong>, sin esperar a que complete todo. Si contesta tres de cinco y se va, esos tres quedan.</li>
  <li><strong>No repreguntar lo que ya dijo.</strong> Nada tumba más rápido una conversación que volver a preguntar el oficio.</li>
  <li><strong>Aceptar cómo habla la gente.</strong> "Somos 4", "traigo cuatro", "cuatro" y "una cuadrilla de 4" son la misma respuesta.</li>
</ul>

<p>Y lo más importante: que esos datos lleguen a la lista del reclutador en columnas separadas, no enterrados en el texto de la conversación. Un dato que hay que ir a buscar al chat es un dato que en la práctica no existe.</p>
`,
    relacionados: [
      { slug: 'cuello-de-botella-reclutamiento-obra.html', titulo: 'Por qué te faltan albañiles si tienes 4,000 candidatos', desc: 'El cuello de botella no es captar. Es llamar.' },
      { slug: 'repartir-candidatos-obra-sin-duplicar.html', titulo: 'Cómo repartir candidatos entre reclutadores sin duplicar llamadas', desc: 'El movimiento de etapa como candado.' },
    ],
  },

  {
    slug: 'cuanto-cuesta-no-llamar-a-un-candidato-de-obra',
    title: 'Cuánto te cuesta no llamarle a un candidato de obra',
    h1: 'Cuánto te cuesta no llamarle a un candidato de obra',
    description:
      'El costo de un candidato sin llamar no aparece en ningún reporte, pero se paga en obra parada y frentes que no abren. Cómo ponerle número.',
    ogTitle: 'Cuánto te cuesta no llamarle a un candidato de obra',
    ogDescription:
      'El costo de la demora no sale en ningún reporte, pero se paga en obra parada.',
    categoria: 'Reclutamiento en obra',
    readTime: 4,
    contenido: `
<p>Los candidatos que nadie llamó no aparecen en ningún reporte. No hay una línea que diga "perdimos esto". Por eso el problema puede durar meses sin que nadie lo note.</p>

<p>Vale la pena ponerle número.</p>

<h2>Lo que ya gastaste antes de la llamada</h2>

<p>Cuando un candidato calificado se queda esperando, ya pagaste:</p>

<ul>
  <li>La publicidad que lo trajo</li>
  <li>El tiempo de quien lo atendió y lo calificó</li>
  <li>El proceso que confirmó que sí es el oficio que buscas</li>
</ul>

<p>Todo eso se tira completo si nadie marca. No es que se pierda "una oportunidad": es que ya se gastó el dinero y no se cobró el resultado.</p>

<h2>Lo que cuesta el frente que no abre</h2>

<p>Este es el caro, y casi nunca se conecta con reclutamiento.</p>

<p>Un frente de obra que no arranca porque falta cuadrilla atrasa la etapa completa. Y en vivienda en serie, un atraso no se queda quieto: empuja el acabado, empuja la entrega, y a veces empuja la escrituración.</p>

<p>Cuando eso pasa, la conversación en la junta es sobre el retraso de obra. Casi nunca sobre los 466 candidatos que llevan tres semanas esperando una llamada, aunque sea exactamente la misma cosa.</p>

<h2>La cuenta rápida</h2>

<p>Toma tu embudo y saca estos cuatro números:</p>

<ul>
  <li><strong>A.</strong> Cuántos candidatos calificados llevan más de una semana sin contacto</li>
  <li><strong>B.</strong> Qué porcentaje de los que sí contactas acaban contratados</li>
  <li><strong>C.</strong> Cuánta gente te falta hoy en obra</li>
  <li><strong>D.</strong> Cuánto te cuesta un día de atraso en el frente que traes parado</li>
</ul>

<p><strong>A × B</strong> son las contrataciones que ya tienes ganadas y no has cobrado. Compáralo contra <strong>C</strong>. En la mayoría de las constructoras que revisamos, A × B es mayor que C.</p>

<p>Es decir: <em>ya tienen a la gente que les falta</em>. Nada más no le han hablado.</p>

<h2>Por qué se cae siempre en el mismo punto</h2>

<p>No es flojera del equipo. Es que llamar es la única parte del proceso que nadie automatizó.</p>

<p>La publicidad corre sola. El filtro corre solo. El registro corre solo. Y de pronto, el proceso le entrega a una persona ocupada una lista sin orden, sin contexto y sin dueño, y espera que adivine por dónde empezar.</p>

<p>Frente a eso, cualquiera empieza por los de arriba y nunca llega abajo.</p>

<h2>Lo que sí se puede arreglar rápido</h2>

<p>No hace falta rehacer el proceso. Con esto se recupera la mayor parte:</p>

<ul>
  <li><strong>Que cada candidato tenga dueño desde el primer día.</strong> Sin dueño, no hay quien responda.</li>
  <li><strong>Que la lista llegue lista para marcar</strong>, con oficio y cuadrilla a la vista, no enterrados en el chat.</li>
  <li><strong>Que quien lleva más tiempo esperando salga primero</strong>, no al último.</li>
  <li><strong>Que alguien vea un número diario</strong>: cuántos se repartieron y cuántos siguen esperando. Lo que no se mide, se acumula.</li>
</ul>

<p>Ninguna de las cuatro requiere contratar a nadie. Requieren que la lista deje de armarse a mano.</p>
`,
    relacionados: [
      { slug: 'cuello-de-botella-reclutamiento-obra.html', titulo: 'Por qué te faltan albañiles si tienes 4,000 candidatos', desc: '4,000 candidatos y cero contratados.' },
      { slug: 'repartir-candidatos-obra-sin-duplicar.html', titulo: 'Cómo repartir candidatos entre reclutadores sin duplicar llamadas', desc: 'Que el reparto deje rastro solo.' },
    ],
  },

  {
    slug: 'automatizar-reclutamiento-obra-que-si-y-que-no',
    title: 'Automatizar el reclutamiento de obra: qué sí y qué no',
    h1: 'Automatizar el reclutamiento de obra: qué sí y qué no',
    description:
      'Qué partes del reclutamiento de personal de obra conviene automatizar, cuáles hay que dejarle a una persona, y en qué orden hacerlo para no romper lo que funciona.',
    ogTitle: 'Automatizar el reclutamiento de obra: qué sí y qué no',
    ogDescription:
      'Qué automatizar, qué dejarle a una persona, y en qué orden.',
    categoria: 'Reclutamiento en obra',
    readTime: 5,
    contenido: `
<p>"Automatizar el reclutamiento" suena a reemplazar reclutadores. No es eso, y quien lo intenta así termina peor que como empezó.</p>

<p>La construcción se contrata con confianza. Un maestro con cuadrilla decide si se va contigo por cómo le hablaron, no por qué tan bonito estaba el formulario. Esa parte no se automatiza.</p>

<p>Lo que sí se automatiza es todo lo que le roba tiempo al reclutador antes y después de esa conversación.</p>

<h2>Sí: filtrar quién es quién</h2>

<p>De cada diez que escriben, varios no buscan trabajo en obra. Andan vendiendo material, preguntando por casas, o de plano se equivocaron de número.</p>

<p>Separar eso es trabajo mecánico y se hace solo. Que el reclutador vea únicamente a quien sí busca chamba en obra.</p>

<h2>Sí: capturar los datos básicos</h2>

<p>Oficio, cuadrilla, herramienta, ciudad y nombre. Preguntarlos uno por uno en el chat y guardarlos en cuanto llegan.</p>

<p>Esto es lo que convierte una lista de teléfonos en una lista de candidatos. Y es exactamente el trabajo que un humano hace peor: repetir las mismas cinco preguntas doscientas veces sin equivocarse ni cansarse.</p>

<h2>Sí: repartir y dar seguimiento</h2>

<p>Quién le toca a quién, quién ya recibió su lista, quién lleva tres semanas esperando. Nada de eso necesita criterio: necesita constancia, que es justo lo que una persona ocupada no puede dar todos los días a las ocho de la mañana.</p>

<h2>No: la llamada</h2>

<p>Aquí es donde muchos se pasan de la raya. Un bot que llama, insiste y agenda por su cuenta puede funcionar para vender un seguro. En obra, no.</p>

<p>El candidato se da cuenta, y lo que se lleva es que esa empresa trata a la gente como número. En un gremio donde todos se conocen y se recomiendan entre ellos, esa fama cuesta más de lo que ahorra.</p>

<h2>No: la decisión de contratar</h2>

<p>Si un maestro trae cuadrilla completa, si de verdad sabe el oficio, si va a aguantar el ritmo. Eso se ve hablando y viéndolo trabajar. Ningún filtro automático sustituye a un residente con años de obra.</p>

<h2>En qué orden hacerlo</h2>

<p>El orden importa más que las herramientas. Así es como no se rompe lo que ya jala:</p>

<ol>
  <li><strong>Primero, medir.</strong> Cuántos candidatos hay, cuántos sin contactar, cuántos días llevan esperando. Sin esto vas a automatizar la parte equivocada.</li>
  <li><strong>Segundo, el reparto.</strong> Es donde más se pierde y lo más fácil de arreglar. Que cada candidato tenga dueño el mismo día.</li>
  <li><strong>Tercero, la captura de datos.</strong> Que la lista llegue con oficio y cuadrilla a la vista.</li>
  <li><strong>Cuarto, el filtro de entrada.</strong> Ya con lo anterior funcionando, quitarle al reclutador a los que no buscan trabajo.</li>
  <li><strong>Al final, lo demás.</strong> Reportes, tableros, integraciones. Se ven muy bien en la junta y son lo que menos mueve la aguja.</li>
</ol>

<p>Casi todos empiezan por el cuarto o por el quinto, porque son los que se ven. Y el problema sigue igual, porque el hoyo estaba en el segundo.</p>

<h2>La prueba de si sirvió</h2>

<p>Una sola pregunta: <strong>¿cuántos candidatos calificados llevan más de una semana sin que nadie les llame?</strong></p>

<p>Si ese número no bajó, no automatizaste el reclutamiento. Automatizaste otra cosa.</p>
`,
    relacionados: [
      { slug: 'cuanto-cuesta-no-llamar-a-un-candidato-de-obra.html', titulo: 'Cuánto te cuesta no llamarle a un candidato de obra', desc: 'Ponerle número a la demora.' },
      { slug: 'que-datos-pedirle-a-un-destajista.html', titulo: 'Los 5 datos que necesitas de un destajista antes de llamarle', desc: 'Qué preguntar y en qué orden.' },
    ],
  },
];
