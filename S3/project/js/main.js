const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
const navLinks = document.querySelectorAll('.main-nav a');
const topicTabs = Array.from(document.querySelectorAll('.topic-tab'));
const topicPanels = Array.from(document.querySelectorAll('.topic-panel'));
const topicOpeners = document.querySelectorAll('[data-open-topic]');
const costRange = document.getElementById('costRange');
const costStepPills = Array.from(document.querySelectorAll('[data-cost-step]'));
const costPrevButton = document.getElementById('costPrev');
const costNextButton = document.getElementById('costNext');
const costScenarioLabel = document.getElementById('costScenarioLabel');
const costScenarioHint = document.getElementById('costScenarioHint');
const costScenarioSummary = document.getElementById('costScenarioSummary');
const costRecommendedClass = document.getElementById('costRecommendedClass');
const costPrimaryDriver = document.getElementById('costPrimaryDriver');
const costTotalIndex = document.getElementById('costTotalIndex');
const routeRange = document.getElementById('routeRange');
const routeStepPills = Array.from(document.querySelectorAll('[data-route-step]'));
const routePrevButton = document.getElementById('routePrev');
const routeNextButton = document.getElementById('routeNext');
const routeStageLabel = document.getElementById('routeStageLabel');
const routeStageDuration = document.getElementById('routeStageDuration');
const routeStageObjective = document.getElementById('routeStageObjective');
const routeConceptList = document.getElementById('routeConceptList');
const routePracticeList = document.getElementById('routePracticeList');
const routeDeliverable = document.getElementById('routeDeliverable');
const routeMilestone = document.getElementById('routeMilestone');
const routeProgressFill = document.getElementById('routeProgressFill');

const costBars = {
  storage: document.getElementById('costBarStorage'),
  requests: document.getElementById('costBarRequests'),
  retrieval: document.getElementById('costBarRetrieval'),
  transfer: document.getElementById('costBarTransfer'),
};

const costSegments = {
  storage: document.getElementById('costSegmentStorage'),
  requests: document.getElementById('costSegmentRequests'),
  retrieval: document.getElementById('costSegmentRetrieval'),
  transfer: document.getElementById('costSegmentTransfer'),
};

const costValues = {
  storage: document.getElementById('costValueStorage'),
  requests: document.getElementById('costValueRequests'),
  retrieval: document.getElementById('costValueRetrieval'),
  transfer: document.getElementById('costValueTransfer'),
};

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    mainNav.classList.toggle('open');
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const activateTopic = (topic) => {
  topicTabs.forEach((tab) => {
    const isActive = tab.dataset.topic === topic;
    tab.classList.toggle('is-active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
    tab.setAttribute('tabindex', isActive ? '0' : '-1');
  });

  topicPanels.forEach((panel) => {
    const isActive = panel.id === `panel-${topic}`;
    panel.classList.toggle('is-active', isActive);
    panel.hidden = !isActive;
  });
};

if (topicTabs.length && topicPanels.length) {
  topicTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      activateTopic(tab.dataset.topic);
    });

    tab.addEventListener('keydown', (event) => {
      if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) {
        return;
      }

      event.preventDefault();
      let nextIndex = index;

      if (event.key === 'ArrowRight') {
        nextIndex = (index + 1) % topicTabs.length;
      }

      if (event.key === 'ArrowLeft') {
        nextIndex = (index - 1 + topicTabs.length) % topicTabs.length;
      }

      if (event.key === 'Home') {
        nextIndex = 0;
      }

      if (event.key === 'End') {
        nextIndex = topicTabs.length - 1;
      }

      topicTabs[nextIndex].focus();
      activateTopic(topicTabs[nextIndex].dataset.topic);
    });
  });
}

if (topicOpeners.length) {
  topicOpeners.forEach((link) => {
    link.addEventListener('click', () => {
      const targetTopic = link.getAttribute('data-open-topic');
      if (targetTopic) {
        activateTopic(targetTopic);
      }
    });
  });
}

// Valores ilustrativos para mostrar cómo cambia el peso relativo por patrón de acceso.
const costScenarios = [
  {
    label: 'Archivo frío',
    hint: 'Pocas lecturas y retención extensa.',
    index: '1.0x',
    summary: 'Aquí domina el almacenamiento de largo plazo y una parte del costo aparece cuando se necesita recuperar algo puntual del archivo.',
    recommendedClass: 'S3 Glacier Flexible Retrieval o Deep Archive',
    primaryDriver: 'retención prolongada y recuperaciones esporádicas',
    parts: { storage: 58, requests: 8, retrieval: 22, transfer: 12 },
  },
  {
    label: 'Respaldo activo',
    hint: 'Lecturas ocasionales y recuperación moderada.',
    index: '1.4x',
    summary: 'El almacenamiento sigue pesando bastante, pero ya empiezan a crecer las solicitudes y la transferencia porque el dato no está totalmente congelado.',
    recommendedClass: 'S3 Standard-IA o Intelligent-Tiering',
    primaryDriver: 'lecturas ocasionales, copias periódicas y algo de egreso',
    parts: { storage: 50, requests: 18, retrieval: 10, transfer: 22 },
  },
  {
    label: 'Contenido web',
    hint: 'Tráfico constante y muchas peticiones.',
    index: '2.3x',
    summary: 'En una aplicación o sitio con descargas frecuentes, el costo se desplaza hacia solicitudes y transferencia, aunque el almacenamiento siga presente.',
    recommendedClass: 'S3 Standard con CloudFront',
    primaryDriver: 'solicitudes repetidas, tráfico y distribución de contenido',
    parts: { storage: 34, requests: 27, retrieval: 4, transfer: 35 },
  },
  {
    label: 'Consumo intensivo',
    hint: 'Mucho egreso y acceso muy frecuente.',
    index: '3.5x',
    summary: 'Cuando el acceso es muy intenso, el almacenamiento deja de ser el centro del costo y pasan a dominar la transferencia y el volumen de peticiones.',
    recommendedClass: 'S3 Standard con optimización fuerte de caché',
    primaryDriver: 'egreso alto, picos de consumo y operaciones constantes',
    parts: { storage: 22, requests: 33, retrieval: 5, transfer: 40 },
  },
];

const canRenderCostScenario = costRange
  && costScenarioLabel
  && costScenarioHint
  && costScenarioSummary
  && costRecommendedClass
  && costPrimaryDriver
  && costTotalIndex;

const updateCostStepPills = (activeIndex) => {
  costStepPills.forEach((pill) => {
    const pillIndex = Number(pill.dataset.costStep);
    const isActive = pillIndex === activeIndex;
    pill.classList.toggle('is-active', isActive);
    pill.setAttribute('aria-pressed', String(isActive));
  });
};

const renderCostScenario = (scenarioIndex) => {
  if (!canRenderCostScenario) {
    return;
  }

  const scenario = costScenarios[scenarioIndex];

  if (!scenario) {
    return;
  }

  costScenarioLabel.textContent = scenario.label;
  costScenarioHint.textContent = scenario.hint;
  costScenarioSummary.textContent = scenario.summary;
  costRecommendedClass.textContent = scenario.recommendedClass;
  costPrimaryDriver.textContent = scenario.primaryDriver;
  costTotalIndex.textContent = scenario.index;

  Object.entries(scenario.parts).forEach(([key, value]) => {
    if (costBars[key]) {
      costBars[key].style.width = `${value}%`;
    }

    if (costSegments[key]) {
      costSegments[key].style.width = `${value}%`;
    }

    if (costValues[key]) {
      costValues[key].textContent = `${value}%`;
    }
  });

  costRange.setAttribute('aria-valuetext', `${scenario.label}: índice relativo ${scenario.index}`);
  updateCostStepPills(scenarioIndex);
};

if (canRenderCostScenario) {
  const setCostScenario = (targetIndex) => {
    const minIndex = 0;
    const maxIndex = costScenarios.length - 1;
    const safeIndex = Math.min(maxIndex, Math.max(minIndex, targetIndex));
    costRange.value = String(safeIndex);
    renderCostScenario(safeIndex);
  };

  const updateCostScenarioFromRange = () => {
    setCostScenario(Number(costRange.value));
  };

  costRange.addEventListener('input', updateCostScenarioFromRange);

  if (costPrevButton) {
    costPrevButton.addEventListener('click', () => {
      setCostScenario(Number(costRange.value) - 1);
    });
  }

  if (costNextButton) {
    costNextButton.addEventListener('click', () => {
      setCostScenario(Number(costRange.value) + 1);
    });
  }

  costStepPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      setCostScenario(Number(pill.dataset.costStep));
    });
  });

  setCostScenario(Number(costRange.value));
}

const routeStages = [
  {
    label: 'Básico',
    duration: 'Semanas 1 y 2',
    objective: 'Entender el modelo de objetos y operar buckets con seguridad mínima.',
    concepts: [
      'Bucket, objeto, clave y prefijo.',
      'Diferencia entre object storage y sistema de archivos.',
      'Carga y descarga con consola o API.',
    ],
    practices: [
      'Crear un bucket de práctica por entorno.',
      'Subir archivos y organizar claves con prefijos claros.',
      'Probar versionado y evidenciar cambios.',
    ],
    deliverable: 'Mini demo de bucket funcional con estructura de nombres.',
    milestone: 'Explicas con propiedad por qué S3 no maneja carpetas reales.',
  },
  {
    label: 'Intermedio',
    duration: 'Semanas 3 y 4',
    objective: 'Diseñar acceso seguro y operar el ciclo de vida básico del bucket.',
    concepts: [
      'Políticas de bucket e IAM.',
      'Versionado y URL prefirmadas.',
      'Cifrado y separación por entorno.',
    ],
    practices: [
      'Crear un flujo de carga controlada desde frontend.',
      'Aplicar reglas de ciclo de vida por antigüedad.',
      'Registrar evidencias para sustentación técnica.',
    ],
    deliverable: 'Demo de carga segura + política documentada.',
    milestone: 'Explicas por qué usas URL prefirmadas y no bucket público.',
  },
  {
    label: 'Avanzado',
    duration: 'Semanas 5 y 6',
    objective: 'Integrar S3 con arquitectura orientada a eventos y analítica.',
    concepts: [
      'Eventos de S3 para procesos asíncronos.',
      'Patrón de data lake por capas.',
      'Monitoreo, tagging y control operativo.',
    ],
    practices: [
      'Disparar una función o cola ante nuevas cargas.',
      'Separar datos en capas raw, processed y curated.',
      'Definir etiquetas para costo y gobierno.',
    ],
    deliverable: 'Flujo de carga que active procesamiento automático.',
    milestone: 'Justificas la integración de S3 dentro de la arquitectura completa.',
  },
  {
    label: 'Aplicado',
    duration: 'Semanas 7 y 8',
    objective: 'Consolidar una propuesta lista para exposición o proyecto final.',
    concepts: [
      'Trade-offs entre costo, seguridad y desempeño.',
      'Selección de clases de almacenamiento por patrón real.',
      'Cierre ejecutivo orientado a arquitectura.',
    ],
    practices: [
      'Construir un caso completo con entrada, proceso y salida.',
      'Simular escenarios de costo y justificar decisiones.',
      'Preparar narrativa técnica con riesgos y mitigaciones.',
    ],
    deliverable: 'Caso integrador con diagrama, políticas y defensa técnica.',
    milestone: 'Sustentas decisiones con criterio arquitectónico, no solo operativo.',
  },
];

const canRenderRouteStage = routeRange
  && routeStageLabel
  && routeStageDuration
  && routeStageObjective
  && routeConceptList
  && routePracticeList
  && routeDeliverable
  && routeMilestone
  && routeProgressFill;

const fillList = (listElement, items) => {
  if (!listElement) {
    return;
  }

  listElement.replaceChildren();
  items.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    listElement.appendChild(li);
  });
};

const updateRouteStepPills = (activeIndex) => {
  routeStepPills.forEach((pill) => {
    const pillIndex = Number(pill.dataset.routeStep);
    const isActive = pillIndex === activeIndex;
    pill.classList.toggle('is-active', isActive);
    pill.setAttribute('aria-pressed', String(isActive));
  });
};

const renderRouteStage = (stageIndex) => {
  if (!canRenderRouteStage) {
    return;
  }

  const stage = routeStages[stageIndex];

  if (!stage) {
    return;
  }

  routeStageLabel.textContent = stage.label;
  routeStageDuration.textContent = stage.duration;
  routeStageObjective.textContent = stage.objective;
  routeDeliverable.textContent = stage.deliverable;
  routeMilestone.textContent = stage.milestone;
  fillList(routeConceptList, stage.concepts);
  fillList(routePracticeList, stage.practices);

  const progress = (stageIndex / (routeStages.length - 1)) * 100;
  routeProgressFill.style.width = `${progress}%`;
  routeRange.setAttribute('aria-valuetext', `${stage.label}, ${stage.duration}`);
  updateRouteStepPills(stageIndex);
};

if (canRenderRouteStage) {
  const setRouteStage = (targetIndex) => {
    const minIndex = 0;
    const maxIndex = routeStages.length - 1;
    const safeIndex = Math.min(maxIndex, Math.max(minIndex, targetIndex));
    routeRange.value = String(safeIndex);
    renderRouteStage(safeIndex);
  };

  routeRange.addEventListener('input', () => {
    setRouteStage(Number(routeRange.value));
  });

  if (routePrevButton) {
    routePrevButton.addEventListener('click', () => {
      setRouteStage(Number(routeRange.value) - 1);
    });
  }

  if (routeNextButton) {
    routeNextButton.addEventListener('click', () => {
      setRouteStage(Number(routeRange.value) + 1);
    });
  }

  routeStepPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      setRouteStage(Number(pill.dataset.routeStep));
    });
  });

  setRouteStage(Number(routeRange.value));
}
