# **Informe de Investigación Exhaustiva: Arquitectura Técnica, Metodología de Entrenamiento y Lógica Algorítmica para la Integración de HYROX en Ecosistemas Digitales (Forgia.fit)**

## **1\. Introducción y Marco Conceptual de la Disciplina**

### **1.1 Definición y Filosofía del HYROX: La Estandarización como Métrica**

El HYROX se ha consolidado en el panorama del fitness global no simplemente como una competición de resistencia, sino como un evento de "Fitness Racing" estandarizado. A diferencia del CrossFit, cuya filosofía central se basa en lo "desconocido y lo incognoscible" (unknown and unknowable), el HYROX opera bajo una premisa diametralmente opuesta: la predictibilidad absoluta y la estandarización métrica.1 Para un desarrollador de aplicaciones como forgia.fit, esta distinción es crítica. Mientras que programar una IA para CrossFit requiere modelos complejos que puedan adaptarse a una varianza infinita de movimientos y dominios de tiempo, el HYROX ofrece un conjunto de datos finito y estructurado, lo que permite una modelización predictiva de altísima precisión.

La estructura de la carrera es inmutable: comienza con 1 km de carrera, seguido de una estación de entrenamiento funcional, secuencia que se repite ocho veces. El volumen total acumulado es de 8 km de carrera y 8 estaciones funcionales distintas.3 Esta constancia permite que el rendimiento no sea una cuestión de suerte con los ejercicios (como que salgan movimientos gimnásticos en un WOD para un atleta pesado), sino una función pura de la capacidad fisiológica y la eficiencia biomecánica.

La filosofía subyacente es la de un test de fitness completo que evalúa tanto la capacidad aeróbica (que constituye aproximadamente el 50% del tiempo total de competición) como la fuerza-resistencia funcional. No existen elementos de alta complejidad técnica o neurológica como los levantamientos olímpicos (snatch) o gimnasia avanzada (muscle-ups), lo que democratiza el acceso pero desplaza la exigencia hacia la capacidad metabólica y la tolerancia al lactato.4

### **1.2 El Fenómeno del "Running Comprometido" (Compromised Running)**

Para entender la lógica de entrenamiento necesaria para una aplicación enfocada en esta disciplina, es imperativo comprender el concepto de "Running Comprometido". En fisiología deportiva aplicada al HYROX, esto se refiere al estado biomecánico y metabólico en el que un atleta debe correr inmediatamente después de haber realizado un esfuerzo funcional que ha generado una fatiga local específica o una deuda de oxígeno significativa.5

Desde una perspectiva algorítmica para la IA de forgia.fit, el tiempo de carrera de un usuario en estado fresco (su marca personal de 10K, por ejemplo) es un predictor insuficiente. La IA debe calcular un "Coeficiente de Degradación" basado en la capacidad del usuario para eliminar lactato mientras corre. Por ejemplo, después del *Sled Push* (Empuje de Trineo), la musculatura extensora de la rodilla (cuádriceps) está saturada de metabolitos, lo que acorta la longitud de la zancada y reduce la flexión de la cadera. Después de los *Burpee Broad Jumps*, la frecuencia cardíaca suele estar cerca del máximo, lo que obliga al sistema respiratorio a competir por la estabilización del core y la ventilación durante la carrera subsiguiente.7

Este fenómeno dicta que la programación del entrenamiento no puede tratar la carrera y la fuerza como silos independientes. La arquitectura del plan de entrenamiento debe integrar sesiones donde la carrera se realiza deliberadamente bajo condiciones de pre-fatiga específica para inducir adaptaciones en el aclaramiento de lactato y la eficiencia neurológica bajo estrés.

## ---

**2\. Análisis Técnico y Normativo: Temporada 2025/2026**

Para que la aplicación forgia.fit sea una herramienta de autoridad, debe reflejar con precisión milimétrica las normativas vigentes. Las reglas del HYROX evolucionan, y la temporada 2025/2026 ha introducido cambios sustanciales que afectan tanto a la estrategia de carrera como a la validación de los movimientos en el entrenamiento.

### **2.1 Matriz de Divisiones, Pesos y Distancias**

La aplicación debe segmentar a los usuarios en las divisiones correctas para prescribir las cargas adecuadas. A continuación, se presenta la matriz oficial de pesos y distancias, fundamental para la base de datos de la aplicación.8

| Estación | Mujeres Open | Mujeres Pro | Hombres Open | Hombres Pro | Dobles Mixtos |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **SkiErg** | 1000m | 1000m | 1000m | 1000m | 1000m |
| **Sled Push** (Incl. trineo) | 102 kg | 152 kg | 152 kg | 202 kg | 152 kg |
| **Sled Pull** (Incl. trineo) | 78 kg | 103 kg | 103 kg | 153 kg | 103 kg |
| **Burpee Broad Jump** | 80m | 80m | 80m | 80m | 80m |
| **Row (Remo)** | 1000m | 1000m | 1000m | 1000m | 1000m |
| **Farmers Carry** | 2 x 16 kg | 2 x 24 kg | 2 x 24 kg | 2 x 32 kg | 2 x 24 kg |
| **Sandbag Lunges** | 10 kg | 20 kg | 20 kg | 30 kg | 20 kg |
| **Wall Balls** (Reps/Peso) | 75 (4kg) | 100 (6kg) | 100 (6kg) | 100 (9kg) | 100 (6kg) |

**Nota Técnica para la IA:** Es crucial notar que en la división de Dobles Mixtos, los pesos de los trineos, los kettlebells y el saco de arena suelen alinearse con la categoría *Hombres Open*, aunque esto puede variar ligeramente según la normativa regional específica del evento.11 La IA debe ser capaz de ajustar estas cargas si el usuario indica que compite en parejas.

### **2.2 Actualizaciones Críticas del Reglamento (2025/2026)**

La IA debe incluir "alertas de juez" o consejos técnicos basados en las nuevas penalizaciones para evitar que los usuarios entrenen patrones de movimiento que resultarían en descalificación o tiempo añadido.12

1. **Penalizaciones Basadas en Tiempo:** Históricamente, si un atleta cometía una infracción de distancia (ej. no cruzar completamente la línea con el trineo), se le obligaba a retroceder. En la temporada 2025/26, esto se ha sustituido mayoritariamente por penalizaciones de tiempo. Tras una advertencia, se añaden **15 segundos** al tiempo final por cada infracción en estaciones como Sleds, Burpees y Lunges.  
2. **La Línea del Sled Pull:** Se prohíbe estrictamente pisar la línea blanca sólida al frente del cajón del atleta durante el tirón de trineo. Este es un error común en principiantes que intentan ganar palanca mecánica. La aplicación debe enfatizar la propiocepción espacial en los entrenamientos de trineo.  
3. **Técnica de Burpee (Step-Up):** El reglamento clarifica que es permitido "subir caminando" (step-up) desde la posición de plancha en el burpee antes de realizar el salto. No es obligatorio realizar un salto explosivo con los pies juntos desde el suelo. Esto es una ventaja táctica masiva para atletas con menor capacidad cardiovascular explosiva, permitiendo mantener la frecuencia cardíaca más baja.  
4. **Calzado en Wall Balls:** Se permite a los atletas quitarse las zapatillas exclusivamente para la estación de Wall Balls (para reducir la altura del talón o mejorar la estabilidad), siempre que carguen con ellas hasta la meta.  
5. **Ajuste del Damper:** Los ergómetros (Ski y Remo) estarán preajustados al nivel 6 para todas las divisiones, aunque el atleta tiene derecho a modificarlo. La IA debería recomendar entrenar habitualmente en el nivel 6 para simular las condiciones de carrera estándar.

## ---

**3\. Análisis Biomecánico y Fisiológico por Estación**

Para que la "potenciación con IA" de forgia.fit sea efectiva, el sistema no puede limitarse a prescribir "hacer remo". Debe entender la biomecánica subyacente para corregir deficiencias y optimizar la economía de movimiento. A continuación, se detalla la ciencia detrás de cada estación para alimentar la base de conocimientos de la aplicación.

### **3.1 SkiErg (1000m): La Cadena Posterior Superior**

Aunque visualmente parece un ejercicio de brazos, el SkiErg es fundamentalmente un movimiento de bisagra de cadera (hip hinge) asistido por el dorsal ancho, tríceps y recto abdominal.

* **Biomecánica:** El ciclo comienza con una extensión triple invertida. La fuerza se genera mediante la contracción explosiva de los abdominales y la flexión de la cadera, utilizando el peso corporal para tirar de las manijas hacia abajo. Los brazos finalizan el movimiento.  
* **Error Común (El "T-Rex"):** Mantener los brazos encogidos y usar solo tríceps. Esto dispara la fatiga local y eleva la frecuencia cardíaca innecesariamente.  
* **Diferencia CrossFit vs. HYROX:** En CrossFit, el SkiErg se usa a menudo para sprints de calorías (\< 1 min). En HYROX, es un esfuerzo de estado estable de 3:30 a 5:00 minutos. La técnica debe priorizar la longitud de la brazada sobre la frecuencia.  
* **Lógica para la IA:** Si el usuario reporta dolor lumbar tras esta estación, prescribir ejercicios de control de core (*Hollow Rocks*) y bisagra de cadera (*Good Mornings*). Recomendar ritmos de 35-40 brazadas por minuto (s/m) para eficiencia.

### **3.2 Sled Push (50m): Potencia Concéntrica Unilateral**

Esta estación es única porque carece casi por completo de fase excéntrica, lo que significa que el daño muscular (rotura de fibras) es bajo, pero la acumulación metabólica (quemazón) es extrema.

* **Biomecánica:** El ángulo del cuerpo es crítico. Un ángulo de 45 grados respecto al suelo maximiza la transferencia de fuerza horizontal. Los brazos deben mantenerse bloqueados o muy pegados al cuerpo para evitar la fatiga de hombros.  
* **El Factor Fricción:** El trineo no pesa solo por los discos, sino por la fricción de la alfombra. La IA debe aconsejar sobre el calzado: zapatillas con suela de goma de alta tracción (como Puma Deviate Nitro o Saucony Endorphin) son esenciales. Las zapatillas de CrossFit planas y duras (Metcon/Nano) a menudo resbalan, haciendo la estación imposible.15  
* **Técnica de Pasos:** Se recomiendan pasos cortos y rápidos (choppy steps) para mantener el trineo en movimiento constante, superando la inercia estática.

### **3.3 Sled Pull (50m): Cadena Posterior y Agarre**

Esta estación a menudo destruye el ritmo de carrera posterior debido a la fatiga lumbar y de glúteos.

* **Técnicas Permitidas:**  
  1. *Caminar hacia atrás:* Agarrar la cuerda, inclinarse hacia atrás y caminar usando el peso corporal. Es la técnica más eficiente para el 90% de los atletas.  
  2. *Tracción Estática:* Plantar los pies y tirar solo con brazos y espalda. Genera mucha fatiga local en bíceps y antebrazos. Menos recomendada salvo para atletas muy pesados.  
* **Gestión de la Cuerda:** Un aspecto táctico vital es la gestión de la cuerda acumulada para no tropezar. La IA debe incluir consejos ("Tips") sobre mantener la cuerda ordenada a un lado.  
* **Lógica para la IA:** Si el usuario falla aquí, prescribir *Dead Hangs* (suspensión en barra) para mejorar el agarre y *Sled Drags* con cinturón para fortalecer la caminata hacia atrás sin fatiga de agarre.

### **3.4 Burpee Broad Jump (80m): El Asesino Metabólico**

Es considerada por muchos la estación más dura debido al pico de frecuencia cardíaca.

* **Biomecánica:** Combina una flexión (push-up), una recuperación a sentadilla y un salto horizontal. La eficiencia se gana en la distancia del salto. Un atleta que salta 1.5 metros por repetición hará \~53 burpees. Uno que salta 1.0 metro hará 80 burpees. Esa diferencia de 27 repeticiones es masiva.  
* **La Técnica "Step-Up":** Para atletas de CrossFit acostumbrados a ir rápido, el consejo de "ir despacio" es contrintuitivo. Sin embargo, subir del suelo dando un paso (un pie y luego otro) en lugar de un salto explosivo mantiene las pulsaciones controladas para la carrera posterior.17  
* **Lógica para la IA:** Monitorizar la "Longitud Media de Salto". Si es \< 1.2m, la IA debe prescribir pliometría horizontal (*Broad Jumps* aislados) y trabajo de movilidad de cadera.

### **3.5 Rowing (1000m): Recuperación Activa**

Situado a mitad de carrera, el remo es a menudo una oportunidad para bajar las pulsaciones si se gestiona bien, o para "morir" si se ataca demasiado fuerte.

* **Biomecánica:** 60% piernas, 30% cuerpo, 10% brazos.  
* **El Mito del Damper:** Muchos atletas novatos ponen el damper al 10 pensando que irán más rápido. Esto solo aumenta la fatiga muscular. La IA debe recomendar un damper entre 5 y 6 para optimizar el "drag factor" y permitir una cadencia fluida sin sobrecargar la espalda baja.  
* **Estrategia:** Se recomienda un ritmo (split) que sea 5-10 segundos más lento que el ritmo de 2k máximo del atleta. Ganar 15 segundos aquí puede costar 1 minuto en la siguiente carrera.

### **3.6 Farmers Carry (200m): Estabilidad de Core y Agarre**

* **Biomecánica:** Es un ejercicio de anti-flexión lateral y estabilidad escapular.  
* **Punto de Fallo:** El agarre. Soltar las pesas rompe el ritmo y obliga a re-acelerar (coste energético alto).  
* **Transferencia CrossFit:** Los practicantes de CrossFit suelen tener buen agarre, pero no bajo fatiga de carrera.  
* **Lógica para la IA:** Si el usuario no puede completar 200m sin soltar (unbroken), prescribir *Heavy Holds* (sostener mancuernas pesadas estáticamente) por tiempos superiores a 90 segundos.

### **3.7 Sandbag Lunges (100m): Resistencia Unilateral**

* **Biomecánica:** Flexión de rodilla bajo carga axial. El saco comprime la caja torácica, dificultando la respiración profunda.  
* **Normativa:** La rodilla trasera debe tocar el suelo. Extensión completa de cadera arriba.  
* **Consejo Técnico:** Descansar el saco sobre los trapecios (parte alta de la espalda), no sobre el cuello (restringe respiración) ni muy bajo (fatiga hombros).  
* **Impacto en Carrera:** Esta estación es la que más "destruye" las piernas para el último kilómetro (Run 8). La sensación de "piernas de gelatina" es máxima aquí.

### **3.8 Wall Balls (75/100 Reps): El Final Mental**

* **Biomecánica:** Sentadilla frontal \+ Press (empuje).  
* **Estrategia:** A diferencia del CrossFit donde se buscan series largas (unbroken), en HYROX, tras 1h+ de carrera, es mejor romper las series desde el principio (ej. 15-15-15-15...) para evitar el fallo muscular y mantener la técnica bajo fatiga extrema.19  
* **Lógica para la IA:** Calcular la estrategia de series basada en el "Max Unbroken Wall Balls" del usuario. Si su máx es 50, prescribir series de 15\. Si es 30, series de 10\.

## ---

**4\. Transición de CrossFit a HYROX: El Análisis de Brechas (Gap Analysis)**

Dado que forgia.fit está enfocada en CrossFit, el perfil de usuario promedio tendrá:

* **Fortalezas:** Alta potencia anaeróbica, fuerza en levantamientos estáticos (Squat, Deadlift), familiaridad con movimientos funcionales (Wall Balls, Burpees).  
* **Debilidades:** Base aeróbica insuficiente para eventos de \>60 min, ineficiencia en carrera (técnica pobre), incapacidad para gestionar ritmos sub-umbrales (tendencia a salir demasiado rápido y "explotar").

### **4.1 La Interferencia Fisiológica**

El CrossFit entrena predominantemente en la vía glucolítica y de fosfágenos (esfuerzos cortos y muy intensos, tipo "Fran"). HYROX es un evento predominantemente aeróbico con picos de lactato. La "brecha" principal es la **capacidad de aclaramiento de lactato**. Un CrossFitter sabe sufrir con lactato alto, pero un atleta de HYROX sabe moverse a una intensidad justo por debajo de la acumulación exponencial de lactato.

### **4.2 Benchmarks de Referencia para la IA**

Para personalizar el plan, la IA debe someter al usuario a un test de nivelación específico. Propongo la siguiente batería de tests para forgia.fit:

1. **Test de Capacidad Aeróbica Pura:** 5 km Run Time Trial. (Dato base para calcular ritmos de carrera).  
2. **Test de Umbral de Lactato:** 30 min Remo o SkiErg por metros máximos.20  
3. **Test de Simulación (PFT \- Physical Fitness Test):** El estándar oficial de HYROX para determinar la división adecuada 21:  
   * 1000m Run  
   * 50 Burpee Broad Jumps  
   * 100 Lunges Estáticos  
   * 1000m Remo  
   * 30 Push Ups  
   * 100 Wall Balls  
   * *Resultados:* 15-25 min (Pro), 25-35 min (Open), 30-45 min (Doubles).

### **4.3 Ajustes de Programación para CrossFitters**

La IA debe modificar la programación típica de CrossFit de la siguiente manera:

* **Reducción de Volumen Gimnástico de Alta Habilidad:** Menos Handstand Walks, Muscle Ups y Snatches. Estos tienen transferencia cero al HYROX y generan fatiga nerviosa.  
* **Incremento del Volumen de Carrera (Zona 2):** Añadir 2-3 sesiones semanales de carrera a baja intensidad (conversacional) para construir la base aeróbica y la durabilidad articular.  
* **Metcons Específicos:** Sustituir los AMRAPs de 10 minutos por intervalos de umbral de 20-40 minutos que mezclen ergómetros y carrera.

## ---

**5\. Arquitectura Algorítmica y Lógica de Programación (IA)**

Esta sección provee la lógica "backend" para que los desarrolladores de forgia.fit estructuren la generación de planes.

### **5.1 Variables de Entrada del Usuario (User Inputs)**

La IA necesita los siguientes datos para triangular el plan:

1. **run\_5k\_time**: Tiempo actual en 5km.  
2. **strength\_metric**: Suma de 1RM Back Squat \+ Deadlift (para evaluar fuerza bruta vs resistencia).  
3. **experience\_level**: Novato, CrossFitter, Corredor, Híbrido.  
4. **race\_date**: Para periodización inversa (tapering).

### **5.2 Lógica de Construcción de Entrenamientos**

La IA no debe seleccionar ejercicios aleatoriamente. Debe usar lógica de "Bloques de Interferencia".

**Algoritmo A: El "Sándwich de Fatiga" (Compromised Simulation)**

* *Objetivo:* Enseñar al cuerpo a correr con fatiga específica.  
* *Estructura:*  
  1. Pre\_Fatigue\_Run: 1km @ Ritmo Umbral (aprox. 10-15 seg más lento que 5k pace).  
  2. Stressor: Estación Funcional (ej. 50m Sled Push @ Peso Competición).  
  3. Post\_Fatigue\_Run: 1km @ Ritmo Umbral.  
* *Lógica de Progresión:* Semana 1 (2 rondas) \-\> Semana 4 (4 rondas) \-\> Semana 8 (Simulación completa).

**Algoritmo B: Bias de Fuerza vs. Motor**

* *Condición:* SI (run\_5k\_time es rápido) Y (strength\_metric es bajo):  
  * *Acción:* El usuario es un "Corredor". Aumentar frecuencia de Sleds pesados y Wall Balls. Reducir volumen de carrera (mantenimiento).  
* *Condición:* SI (run\_5k\_time es lento) Y (strength\_metric es alto):  
  * *Acción:* El usuario es un "Levantador/CrossFitter". Aumentar volumen de carrera Zona 2 drásticamente. Introducir intervalos de carrera en pista (Track intervals).

### **5.3 El Factor "Roxzone" en la IA**

La IA debe incluir en las simulaciones el tiempo de transición.

* *Cálculo:* Tiempo\_Total\_Estimado \= (8 \* Tiempo\_Carrera\_Fatigada) \+ Suma(Tiempos\_Estaciones) \+ (8 \* Tiempo\_Transición).  
* *Variable:* Tiempo\_Transición promedio es 3-5 min (Elite) vs 7-12 min (Open). La IA debe entrenar al usuario para minimizar esto ("transiciones rápidas" en los entrenamientos).

## ---

**6\. Estructura de Periodización y Biblioteca de Entrenamientos**

### **6.1 Macrociclo de 12 Semanas (Modelo Híbrido)**

#### **Fase 1: Base Aeróbica y Fuerza Estructural (Semanas 1-4)**

*Enfoque:* Construir el motor diésel y familiarizarse con la técnica de los movimientos sin fatiga extrema.

* **Lunes:** Carrera Zona 2 (45-60 min).  
* **Martes:** Fuerza Inferior (Sentadilla Trasera, Peso Muerto Rumano) \+ Skill Sled Push.  
* **Miércoles:** Intervalos Aeróbicos (Remo/Ski: 4 x 1500m @ Ritmo moderado).  
* **Jueves:** Carrera Tempo (30 min a ritmo sostenido "incómodo").  
* **Viernes:** Fuerza Superior \+ Wall Ball mecánica.  
* **Sábado:** "Long Run" (Carrera larga 60-90 min) O Metcon largo de CrossFit (baja intensidad).  
* **Domingo:** Descanso total.

#### **Fase 2: Construcción del Umbral y Running Comprometido (Semanas 5-9)**

*Enfoque:* Aumentar la intensidad. Introducir el "Sándwich de Fatiga".

* **Workout Clave ("The Compromise"):**  
  * 3 Rondas de:  
  * 1000m Carrera  
  * 50m Sled Push  
  * 1000m Carrera  
  * 50m Sled Pull  
  * *Descanso:* 3 minutos entre rondas.

#### **Fase 3: Especificidad de Carrera y Tapering (Semanas 10-12)**

*Enfoque:* Simulaciones de carrera y afinamiento.

* **Semana 10:** Simulación completa de HYROX (al 80-90% de esfuerzo).  
* **Semana 11:** Volumen al 60%. Intervalos cortos y rápidos.  
* **Semana 12 (Race Week):**  
  * Lun: 30 min carrera suave.  
  * Mar: 20 min movilidad \+ 4 sprints cortos.  
  * Jue-Vie: Descanso activo / Movilidad.  
  * Sáb/Dom: CARRERA.

### **6.2 Ejercicios Básicos para Empezar (De Cero)**

Para usuarios que no vienen del CrossFit, la IA debe sugerir progresiones:

1. **Para Sled Push:** Empezar con "Plank Pushes" (empujar un disco en el suelo sobre una toalla) para aprender a bloquear el core.  
2. **Para Burpees:** "Sprawls" (sin flexión) para acondicionar la cadera antes de bajar el pecho al suelo.  
3. **Para Wall Balls:** "Thrusters" con mancuernas ligeras para aprender la coordinación piernas-brazos.

## ---

**7\. Estrategia de Competición y Nutrición Intra-Evento**

### **7.1 Pacing: La Regla del 85%**

El error número uno es salir corriendo el primer kilómetro a ritmo de 5k.

* **Instrucción para la App:** "Tu primer kilómetro debe ser tu kilómetro más lento".  
* **SkiErg:** No intentar ganar tiempo aquí. Ahorrar 10 segundos puede costar 2 minutos después por acidosis. Mantener un ritmo sostenible.

### **7.2 Nutrición Intra-Carrera**

El HYROX dura entre 60 y 100 minutos para la mayoría, entrando en la zona donde la depleción de glucógeno afecta el rendimiento.22

* **Estrategia:**  
  * *Pre-Carrera:* Carga de carbohidratos 24-48h antes (arroz, pasta, patata). Comida pre-carrera (3h antes) baja en grasa y fibra.  
  * *Durante:* Se recomienda un gel de carbohidratos (25-30g) justo después del Sled Pull (aprox. minuto 35-45). Esto provee glucosa rápida para la segunda mitad (Burpees, Lunges, Wall Balls) que es metabólicamente más demandante.  
  * *Hidratación:* Beber pequeños sorbos en la Roxzone. No grandes tragos para evitar malestar estomacal al hacer Burpees.

### **7.3 Equipamiento: El Debate del Calzado**

La elección de zapatillas es crítica y debe figurar en la sección de "Preparación" de la app.

* **El Problema:** Las zapatillas de correr con placa de carbono (Vaporfly, Alphafly) tienen suelas con poca tracción en moqueta/alfombra, lo que hace resbalar en el Sled Push. Las de CrossFit (Metcon) son horribles para correr 8km.  
* **La Solución:** Zapatillas "Híbridas" o de Running con suela de alta tracción.  
  * *Top Recomendaciones 2025:* **Puma Deviate Nitro 3** (Suela PumaGrip excelente, placa de carbono para correr), **Saucony Endorphin Pro** (buen balance).  
  * *Consejo:* Limpiar la suela con un trapo húmedo justo antes de entrar al cajón de salida para quitar polvo y maximizar agarre.

## ---

**8\. Conclusión para la Integración en Forgia.fit**

La integración de HYROX en forgia.fit representa una oportunidad única para capturar un mercado en expansión masiva. La clave del éxito no está en simplemente listar los WODs, sino en construir un algoritmo que entienda la fisiología de la interferencia.

Al utilizar los datos de referencia proporcionados (tiempos de corte, pesos por división) y aplicar la lógica de "Running Comprometido", la aplicación podrá ofrecer un valor real: no solo decir qué hacer, sino predecir cómo se sentirá el usuario y ajustar el entrenamiento para evitar el estancamiento típico del CrossFitter que intenta correr largas distancias. La estandarización del HYROX es el aliado perfecto para la Inteligencia Artificial.

### ---

**Apéndice: Tablas de Datos para Base de Datos de la App**

#### **Tiempos Objetivo (Splits) para Diferentes Niveles**

*Utilizar estos datos para que la IA establezca objetivos de ritmo (Pacing Targets).* 23

| Estación | Elite (Sub 60\) | Avanzado (1:15) | Intermedio (1:30) | Principiante (1:45) |
| :---- | :---- | :---- | :---- | :---- |
| **Run (Avg/km)** | 3:50 | 4:30 | 5:15 | 6:15 |
| **SkiErg** | 3:40 | 4:15 | 4:45 | 5:30 |
| **Sled Push** | 2:30 | 3:00 | 3:45 | 4:30 |
| **Sled Pull** | 3:30 | 4:30 | 5:30 | 6:30 |
| **Burpees** | 3:15 | 4:30 | 5:45 | 7:00 |
| **Row** | 3:50 | 4:20 | 4:50 | 5:30 |
| **Farmers** | 1:30 | 2:00 | 2:45 | 3:30 |
| **Lunges** | 3:15 | 4:30 | 5:30 | 7:00 |
| **Wall Balls** | 3:45 | 5:00 | 6:30 | 8:00 |
| **Roxzone (Total)** | 3:30 | 6:00 | 9:00 | 12:00 |

\[Fin del Informe\]

#### **Obras citadas**

1. HYROX Rulebooks, including 2024-2025 rule changes | Gym Professor Blog, fecha de acceso: febrero 10, 2026, [https://www.thegymrevolution.co.uk/blog/2024/01/11/hyrox-rulebooks/](https://www.thegymrevolution.co.uk/blog/2024/01/11/hyrox-rulebooks/)  
2. SINGLE \- Website Adjustment Request \- HYROX, fecha de acceso: febrero 10, 2026, [https://maintain.hyrox.com/rulebooks/HYROX\_RulebookSingles\_EN.pdf](https://maintain.hyrox.com/rulebooks/HYROX_RulebookSingles_EN.pdf)  
3. Hyrox: The Ultimate Fitness Race | Training, Equipment & Guide \- Iron Company, fecha de acceso: febrero 10, 2026, [https://www.ironcompany.com/blog/hyrox-fitness-race-training-equipment-guide](https://www.ironcompany.com/blog/hyrox-fitness-race-training-equipment-guide)  
4. CrossFit vs Hyrox: These Are the Key Differences That Matter \- Men's Health, fecha de acceso: febrero 10, 2026, [https://www.menshealth.com/uk/fitness/a65588981/crossfit-vs-hyrox-performance-study/](https://www.menshealth.com/uk/fitness/a65588981/crossfit-vs-hyrox-performance-study/)  
5. The Science of HYROX Performance: A Complete Training and Nutrition Protocol, fecha de acceso: febrero 10, 2026, [https://www.fathomnutrition.com/blogs/all-articles/hyrox-training-guide-science-based-performance](https://www.fathomnutrition.com/blogs/all-articles/hyrox-training-guide-science-based-performance)  
6. The Ultimate Guide To Compromised Running | Hybrid Athlete Club, fecha de acceso: febrero 10, 2026, [https://hybridathleteclub.com/the-ultimate-guide-to-compromised-running](https://hybridathleteclub.com/the-ultimate-guide-to-compromised-running)  
7. Breaking Down HYROX: What Each Station Involves \- Horizon Leisure Centres, fecha de acceso: febrero 10, 2026, [https://horizonlc.com/2025/04/breaking-down-hyrox-what-each-station-involves/](https://horizonlc.com/2025/04/breaking-down-hyrox-what-each-station-involves/)  
8. HYROX Weights: How Heavy are They? \- The Gym Group, fecha de acceso: febrero 10, 2026, [https://www.thegymgroup.com/blog/hyrox-weights/](https://www.thegymgroup.com/blog/hyrox-weights/)  
9. HYROX Weights: All Standards at a Glance \- Pace Club, fecha de acceso: febrero 10, 2026, [https://www.pace-club.com/blog/hyrox-weights](https://www.pace-club.com/blog/hyrox-weights)  
10. The Complete Guide to HYROX Divisions, fecha de acceso: febrero 10, 2026, [https://hellohyrox.com/2025/01/03/the-complete-guide-to-hyrox-divisions-weights-records-and-more/](https://hellohyrox.com/2025/01/03/the-complete-guide-to-hyrox-divisions-weights-records-and-more/)  
11. Hyrox mixed \- Reddit, fecha de acceso: febrero 10, 2026, [https://www.reddit.com/r/hyrox/comments/1q9pdpb/hyrox\_mixed/](https://www.reddit.com/r/hyrox/comments/1q9pdpb/hyrox_mixed/)  
12. HYROX Releases 2025/26 Season Rulebook — No More Spitting or Snot Rockets, fecha de acceso: febrero 10, 2026, [https://barbend.com/news/hyrox-releases-new-season-rulebook/](https://barbend.com/news/hyrox-releases-new-season-rulebook/)  
13. 2025/26 HYROX Rulebook Updates \- Rox Lyfe, fecha de acceso: febrero 10, 2026, [https://roxlyfe.com/2025-26-rulebooks/](https://roxlyfe.com/2025-26-rulebooks/)  
14. HYROX announces changes to Rulebook for 2025-26 season \- endurance.biz, fecha de acceso: febrero 10, 2026, [https://endurance.biz/2025/industry-news/hyrox-announces-changes-to-rulebook-for-2025-26-season/](https://endurance.biz/2025/industry-news/hyrox-announces-changes-to-rulebook-for-2025-26-season/)  
15. Best shoes? : r/hyrox \- Reddit, fecha de acceso: febrero 10, 2026, [https://www.reddit.com/r/hyrox/comments/1knftsq/best\_shoes/](https://www.reddit.com/r/hyrox/comments/1knftsq/best_shoes/)  
16. The Best Shoes for HYROX 2025: Tested for Grip, Stability and Speed \- rb100.fitness, fecha de acceso: febrero 10, 2026, [https://rb100.fitness/articles/hyrox/best-hyrox-shoes-2025/](https://rb100.fitness/articles/hyrox/best-hyrox-shoes-2025/)  
17. HYROX Burpee Broad Jumps Guide \- Rox Lyfe, fecha de acceso: febrero 10, 2026, [https://roxlyfe.com/hyrox-burpee-broad-jumps-guide/](https://roxlyfe.com/hyrox-burpee-broad-jumps-guide/)  
18. HYROX station guides: Burpee Broad Jumps \- Centr, fecha de acceso: febrero 10, 2026, [https://centr.com/blog/show/36906/hyrox-burpee-broad-jumps](https://centr.com/blog/show/36906/hyrox-burpee-broad-jumps)  
19. HYROX Stations: Technique, Training and Race Day Strategy | Bend \+ Mend: Physiotherapy and Pilates in Sydney's CBD, fecha de acceso: febrero 10, 2026, [https://bendandmend.com.au/news/sports-physiotherapy/hyrox-stations-technique-training-and-race-day-strategy/](https://bendandmend.com.au/news/sports-physiotherapy/hyrox-stations-technique-training-and-race-day-strategy/)  
20. How to Pace Each HYROX Station for Maximum Efficiency \- rb100 ..., fecha de acceso: febrero 10, 2026, [https://rb100.fitness/articles/hyrox/hyrox-pacing-strategy/](https://rb100.fitness/articles/hyrox/hyrox-pacing-strategy/)  
21. Physical Fitness Test (P'F'”T) \- HYROX, fecha de acceso: febrero 10, 2026, [https://hyroxhk.com/physical-fitness-test/](https://hyroxhk.com/physical-fitness-test/)  
22. Ultimate Hyrox Nutrition Guide \- Triage Method, fecha de acceso: febrero 10, 2026, [https://triagemethod.com/ultimate-hyrox-nutrition-guide/](https://triagemethod.com/ultimate-hyrox-nutrition-guide/)  
23. HAC Hyrox Calculator | Hybrid Athlete Club, fecha de acceso: febrero 10, 2026, [https://hybridathleteclub.com/hyrox-race-calculator/](https://hybridathleteclub.com/hyrox-race-calculator/)  
24. The HYROX Split That Actually Decides Your Finish Time \- Some more data to discuss, fecha de acceso: febrero 10, 2026, [https://www.reddit.com/r/hyrox/comments/1q6qih8/the\_hyrox\_split\_that\_actually\_decides\_your\_finish/](https://www.reddit.com/r/hyrox/comments/1q6qih8/the_hyrox_split_that_actually_decides_your_finish/)