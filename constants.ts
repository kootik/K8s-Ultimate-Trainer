import { LevelConfig, LevelType } from './types';

const JUNIOR_MODULES = [
  {
    id: 'j1', title: '1. Основы K8s (Core)', desc: 'Pods, Deployments, Architecture',
    questions: [
      {
        q: "Что такое Pod и почему это не то же самое, что контейнер?",
        a: `<p><strong>Pod</strong> — это минимальная и простейшая единица в объектной модели Kubernetes, которую вы создаете или развертываете. Pod представляет собой процесс, запущенный в кластере.</p>
            <p>Ключевое отличие от контейнера в том, что Pod — это <strong>среда выполнения</strong> (конверт) для одного или нескольких контейнеров. Контейнеры внутри одного Pod всегда:</p>
            <ul class="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Размещаются вместе (Co-located):</strong> Всегда запускаются на одной и той же Node.</li>
                <li><strong>Делят сеть (Network Namespace):</strong> Имеют один IP-адрес на всех. Контейнеры могут общаться друг с другом через <code>localhost</code>.</li>
                <li><strong>Делят хранилище:</strong> Могут монтировать одни и те же тома (Volumes) для обмена данными.</li>
            </ul>`,
        tip: "На интервью важно упомянуть, что Pod — это атомарная единица масштабирования. Вы не масштабируете контейнеры внутри пода, вы масштабируете количество подов."
      },
      {
        q: "Deployment vs StatefulSet: в чем разница и когда использовать?",
        a: `<p>Это два разных контроллера для управления подами.</p>
            <h4 class="font-bold mt-2">Deployment</h4>
            <p>Предназначен для <strong>Stateless</strong> приложений (веб-серверы, API, фронтенд).
            <br>Особенности:
            <ul>
                <li>Поды взаимозаменяемы ("cattle").</li>
                <li>Имена подов случайны (<code>web-7f8b9c-xk2z</code>).</li>
                <li>Порядок запуска и остановки не важен.</li>
                <li>Использует ReplicaSet под капотом.</li>
            </ul></p>
            
            <h4 class="font-bold mt-2">StatefulSet</h4>
            <p>Предназначен для <strong>Stateful</strong> приложений (Базы данных, Zookeeper, Kafka).
            <br>Особенности:
            <ul>
                <li>Поды уникальны и имеют "личность" ("pets").</li>
                <li>Имена предсказуемы и стабильны (<code>db-0</code>, <code>db-1</code>).</li>
                <li>Строгий порядок запуска (0 -> 1) и удаления (1 -> 0).</li>
                <li>Стабильное сетевое имя и привязка к PersistentVolume.</li>
            </ul></p>`,
        tip: "Если вы используете базу данных, вам почти всегда нужен StatefulSet (или Operator), чтобы сохранить целостность данных при рестартах."
      },
      {
        q: "В чем разница между Imperative и Declarative подходом?",
        a: `<p><strong>Imperative (Императивный):</strong> Вы говорите системе <em>как</em> достичь результата шаг за шагом.</p>
            <ul><li><code>kubectl run nginx --image=nginx</code></li><li><code>kubectl scale deployment nginx --replicas=3</code></li></ul>
            <p><em>Минусы:</em> Трудно воспроизвести, нет истории изменений в Git.</p>

            <p><strong>Declarative (Декларативный):</strong> Вы описываете <em>желаемое конечное состояние</em> (Desired State), а система сама решает, как к нему прийти.</p>
            <ul><li>Вы создаете YAML файл: <code>replicas: 3</code>.</li><li><code>kubectl apply -f deployment.yaml</code></li></ul>
            <p><em>Плюсы:</em> GitOps, воспроизводимость, идемпотентность (можно применять много раз без ошибок).</p>`,
        tip: "Declarative — это стандарт индустрии (Infrastructure as Code)."
      }
    ]
  },
  {
    id: 'j2', title: '2. Сервисы (Network Basics)', desc: 'Services, DNS',
    questions: [
      {
        q: "Какие бывают типы Service и для чего они нужны?",
        a: `<p>Service — это абстракция, которая определяет логический набор подов и политику доступа к ним.</p>
            <ul class="list-disc pl-5 space-y-2">
                <li><strong>ClusterIP (Default):</strong> Сервис получает внутренний IP-адрес, доступный <em>только</em> изнутри кластера. Используется для связи микросервисов между собой.</li>
                <li><strong>NodePort:</strong> Открывает статический порт (диапазон 30000-32767) на IP-адресе <em>каждой</em> ноды. Трафик на этот порт перенаправляется на сервис. Позволяет доступ извне.</li>
                <li><strong>LoadBalancer:</strong> Создает внешний балансировщик нагрузки облачного провайдера (AWS ELB, Google LB), который направляет трафик на NodePort сервиса. Дает "белый" IP.</li>
                <li><strong>ExternalName:</strong> Не имеет селекторов и портов. Работает как DNS CNAME запись, перенаправляя запросы на внешнее доменное имя (например, <code>rds.aws.amazon.com</code>).</li>
            </ul>`,
        tip: "В реальном проде NodePort редко используют напрямую. Обычно он служит 'клеем' для Ingress Controller или внешнего Load Balancer."
      },
      {
        q: "Как работает Service Discovery (DNS) в Kubernetes?",
        a: `<p>Kubernetes использует аддон (обычно <strong>CoreDNS</strong>), который следит за API сервером и создает DNS записи для каждого сервиса.</p>
            <p>Если сервис называется <code>my-service</code> в неймспейсе <code>my-ns</code>, ему присваивается запись:</p>
            <code>my-service.my-ns.svc.cluster.local</code>
            <p>Поды в том же неймспейсе могут обращаться к нему просто по имени <code>my-service</code>. Поды из других неймспейсов должны использовать полное имя (FQDN).</p>`,
        tip: "Самый быстрый способ отладить DNS: `kubectl run -it --rm --restart=Never debug --image=busybox:1.28 -- nslookup my-service`."
      }
    ]
  },
  {
    id: 'j3', title: '3. Workloads & Configuration', desc: 'Jobs, ConfigMaps, Labels',
    questions: [
      {
        q: "В чем разница между Jobs и CronJobs? Приведи пример использования.",
        a: `<p>Оба ресурса предназначены для запуска задач, которые должны завершиться (Run-to-completion).</p>
            <ul class="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Job:</strong> Создает один или несколько подов и гарантирует, что заданное количество из них успешно завершится. Запускается <strong>один раз</strong> (по требованию).
                    <br><em>Use Case:</em> Миграция базы данных, запуск скрипта обработки данных.</li>
                <li><strong>CronJob:</strong> Создает Job на основе расписания (Cron format). Запускается <strong>периодически</strong>.
                    <br><em>Use Case:</em> Ежедневный бэкап, очистка кэша, запуск ежечасного отчета.</li>
            </ul>
            <p class="mt-2 text-sm bg-gray-100 p-2 rounded"><strong>Важно:</strong> CronJob — это просто планировщик, который создает Job в нужный момент, а Job уже управляет подами.</p>`,
        tip: "Упомяните, что Jobs могут работать в параллельном или последовательном режимах (parallelism)."
      },
      {
        q: "Что такое ConfigMap и в чем его фундаментальное отличие от Secret?",
        a: `<p>Оба объекта используются для отделения конфигурации от образа контейнера.</p>
            <ul class="list-disc pl-5 mt-2 space-y-1">
                <li><strong>ConfigMap:</strong> Хранит <strong>неконфиденциальные</strong> данные (например, URL API, логический уровень, настройки логирования).</li>
                <li><strong>Secret:</strong> Хранит <strong>конфиденциальные</strong> данные (пароли, токены, ключи TLS).</li>
            </ul>
            <p class="mt-2"><strong>Отличие:</strong> ConfigMap хранится в etcd открытым текстом. Secret хранится в etcd закодированным в Base64. <strong>Base64 — это кодирование, а не шифрование.</strong> В обоих случаях для доступа требуется RBAC, но Secret может быть дополнительно защищен 'Encryption at Rest' на уровне API Server.</p>
            <h4 class="font-bold mt-2">Способы монтирования ConfigMap:</h4>
            <ol class="list-decimal pl-5 space-y-1">
                <li>Переменная окружения (Env Vars).</li>
                <li>Монтирование файла в Volume (рекомендуемый способ для ConfigMap и Secret).</li>
            </ol>`,
        tip: "Подчеркните, что ConfigMap и Secret лучше монтировать файлами, чтобы обеспечить автоматическое обновление данных без рестарта пода (File Watch)."
      },
      {
        q: "Как работают Labels и Selectors в Kubernetes?",
        a: `<p>Это механизм, позволяющий <strong>связывать</strong> ресурсы и обеспечивать гибкое управление.</p>
            <ul class="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Label (Метка):</strong> Пары ключ/значение (<code>app: nginx</code>, <code>env: prod</code>), прикрепленные к объекту (Pod, Node, Service).</li>
                <li><strong>Selector (Селектор):</strong> Выражение (например, <code>app=nginx, tier!=db</code>), которое ищет объекты, имеющие соответствующие метки.</li>
            </ul>
            <p class="mt-2"><strong>Ключевая роль:</strong> Селекторы используются для:</p>
            <ul>
                <li><strong>Service:</strong> Выбрать поды для балансировки нагрузки.</li>
                <li><strong>Deployment/ReplicaSet:</strong> Определить, какими подами управлять.</li>
                <li><strong>NetworkPolicy:</strong> Определить, на какие поды распространяется правило.</li>
            </ul>`,
        tip: "Метки — это основа архитектуры Kubernetes. Скажите, что они позволяют достичь слабой связанности (decoupling) между приложениями и сервисами."
      }
    ]
  },
  {
    id: 'j4', title: '4. Isolation & Troubleshooting', desc: 'Namespaces, Quotas, Common Errors',
    questions: [
      {
        q: "Для чего нужен Namespace и как ResourceQuota обеспечивает изоляцию?",
        a: `<p><strong>Namespace (Пространство имен)</strong> обеспечивает логическое разделение ресурсов внутри одного физического кластера.</p>
            <ul class="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Изоляция:</strong> Объекты в одном Namespace не видны напрямую в другом (кроме Services по FQDN).</li>
                <li><strong>RBAC:</strong> Роли (Role) действуют только внутри своего Namespace.</li>
            </ul>
            <p class="mt-2"><strong>ResourceQuota</strong> используется для управления <strong>потреблением</strong> ресурсов внутри Namespace. Она ограничивает:</p>
            <ul>
                <li>Общее количество CPU/Memory Requests/Limits.</li>
                <li>Количество объектов (подов, сервисов, PVC).</li>
            </ul>`,
        tip: "ResourceQuota — это 'жесткий' лимит. Если его превысить, API Server отклонит запрос с ошибкой 403 Forbidden. Это предотвращает перегрузку кластера одним пользователем."
      },
      {
        q: "У тебя под в статусе CrashLoopBackoff. Каков алгоритм действий?",
        a: `<p>Это означает, что контейнер падает сразу после старта, Kubernetes пытается его перезапустить (Backoff), и цикл повторяется.</p>
            <h4 class="font-bold mt-2">Алгоритм диагностики (в порядке):</h4>
            <ol class="list-decimal pl-5 space-y-1">
                <li><strong><code>kubectl describe pod <name></code>:</strong> Ищем секцию Events внизу. Часто видно, что не хватает ресурсов (OOMKilled) или что-то не так с монтированием.</li>
                <li><strong><code>kubectl logs <name> --previous</code>:</strong> Смотрим логи <em>предыдущей</em> (упавшей) инкарнации контейнера. Это покажет ошибку в самом приложении.</li>
                <li><strong>Проверка Config/Secret:</strong> Убедиться, что переменные окружения и смонтированные ConfigMaps/Secrets существуют и содержат верные данные.</li>
                <li><strong>Проверка команды:</strong> Убедиться, что <code>command</code> и <code>args</code> в спецификации пода верны.</li>
            </ol>`,
        tip: "Всегда используйте флаг `--previous` при просмотре логов. Логи текущей, только что запущенной, инкарнации будут пусты."
      },
      {
        q: "У тебя под в статусе ImagePullBackOff. Что это значит и как исправить?",
        a: `<p>Это означает, что Kubelet не смог загрузить образ контейнера (Image).</p>
            <h4 class="font-bold mt-2">Причины и действия:</h4>
            <ul class="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Неверное имя образа (Typo):</strong> Проверить имя образа (<code>image: registry/repo/image:tag</code>).</li>
                <li><strong>Неверный тег:</strong> Проверить, что тег (например, <code>latest</code>, <code>v1.2.3</code>) реально существует в реестре.</li>
                <li><strong>Проблема с доступом (Auth):</strong> Если реестр приватный, нужно убедиться, что <code>imagePullSecrets</code> в поде ссылается на существующий Secret.</li>
                <li><strong>Сетевая проблема:</strong> Нода не может достучаться до Registry. (Редко, но бывает).</li>
            </ul>
            <p class="mt-2 text-sm bg-gray-100 p-2 rounded">
              Диагностика: <code>kubectl describe pod <name></code> (искать сообщение <code>Failed to pull image ...</code>) или <code>journalctl -u kubelet</code> на самой ноде.
            </p>`,
        tip: "Обязательно упомяните `imagePullSecrets`. Это стандартный механизм аутентификации для приватных реестров (Docker Hub, Gitlab Registry и т.п.)."
      }
    ]
  }
];

const MIDDLE_MODULES = [
  {
    id: 'm1', title: '1. Архитектура и Control Plane', desc: 'Deep Dive Flow',
    questions: [
      {
        q: "Что происходит под капотом, когда мы делаем `kubectl apply`?",
        a: `<p>Это асинхронный процесс, вовлекающий множество компонентов.</p>
            <div class="bg-slate-800 text-white p-4 rounded text-sm font-mono my-2 whitespace-pre-wrap">
1. kubectl -> API Server (AuthN, AuthZ, Validation)
2. API Server -> Etcd (Запись Desired State)
3. Controller Manager (Deployment Controller) -> Видит новый Deployment -> Создает ReplicaSet (в API)
4. Controller Manager (ReplicaSet Controller) -> Видит RS -> Создает Pod object (в API)
5. Scheduler -> Видит Pod без nodeName -> Выбирает ноду (Filtering/Scoring) -> Записывает nodeName (Binding)
6. Kubelet (на ноде) -> Видит Pod назначен себе -> CRI (Containerd) -> Запуск контейнера
7. Kubelet -> Обновляет статус в API Server -> Etcd
            </div>
            <p>Никто не отдает прямых приказов. Все компоненты работают через наблюдение (Watch) за изменениями в Etcd.</p>
            
            <div class="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100 text-sm">
              <h5 class="font-bold text-blue-800 mb-2">GitOps Workflow (ArgoCD / Flux):</h5>
              <p class="mb-2 text-blue-900">В продакшене <code>kubectl apply</code> редко выполняется вручную. Обычно используется процесс:</p>
              <ol class="list-decimal pl-4 space-y-1 text-blue-900">
                 <li><strong>Commit:</strong> Инженер пушит изменения YAML/Helm в Git-репозиторий.</li>
                 <li><strong>Detect:</strong> ArgoCD (внутри кластера) видит изменение хэша коммита (через Webhook или Polling).</li>
                 <li><strong>Diff:</strong> Контроллер сравнивает <em>Desired State</em> (Git) с <em>Live State</em> (Etcd).</li>
                 <li><strong>Sync:</strong> Если есть дрифт (OutOfSync), оператор выполняет применение манифестов (аналог <code>kubectl apply</code>) для приведения кластера к состоянию в Git.</li>
              </ol>
              <p class="mt-2 text-xs text-blue-700 font-medium">Это гарантирует, что Git является единственным источником правды (SSOT) и защищает от неконтролируемых ручных правок.</p>
            </div>`,
        tip: "Ключевое слово — 'Reconciliation Loop' (Петля согласования). Это сердце K8s."
      },
      {
        q: "Зачем нужен HA кластер (3 мастера) и как работает кворум Etcd?",
        a: `<p>Один мастер — это точка отказа (SPOF). Три мастера нужны для отказоустойчивости.</p>
            <p><strong>Etcd</strong> (база данных кластера) использует алгоритм консенсуса <strong>RAFT</strong>. Для записи данных (согласования) требуется большинство голосов (Кворум).</p>
            <p>Формула кворума: <code>(N / 2) + 1</code>.</p>
            <ul>
                <li>Для 3 нод: (3/2)+1 = 2. Можно потерять 1 ноду.</li>
                <li>Если падают 2 ноды, остается 1. 1 < 2. <strong>Кворума нет.</strong></li>
            </ul>
            <p>При потере кворума кластер переходит в режим Read-Only (или полностью блокирует изменения). Работающие приложения (Data Plane) не страдают, но управлять кластером невозможно.</p>`,
        tip: "Производительность Etcd критически зависит от скорости диска (latency). Всегда используйте SSD/NVMe и избегайте разделения диска с другими интенсивными процессами."
      },
      {
        q: "Kubelet — это клиент или сервер?",
        a: `<p>Это подвох. Он является <strong>и тем, и другим</strong>.</p>
            <ul class="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Клиент (основная роль):</strong> Он подключается к API Server для получения <code>PodSpecs</code> (что мне запустить?) и отправки <code>NodeStatus/PodStatus</code>.</li>
                <li><strong>Сервер (HTTPS :10250):</strong> Он слушает команды от API Server. Например, когда вы делаете <code>kubectl logs</code> или <code>kubectl exec</code>, API Server соединяется с Kubelet-ом и просит поток данных. Также Prometheus scrape metrics с него.</li>
            </ul>`,
        tip: "Отличный момент упомянуть безопасность: порт 10250 часто является вектором атаки, если не закрыт аутентификацией/сертификатами."
      },
      {
        q: "Зачем нужен Container Runtime Interface (CRI) и почему убрали Docker?",
        a: `<p>Kubernetes не хочет зависеть от конкретного софта (Docker). Ему нужен интерфейс.</p>
            <div class="bg-slate-800 text-white p-4 rounded text-sm font-mono my-2 whitespace-pre-wrap">
Раньше (Dockershim):
Kubelet -> Dockershim (hack) -> Docker Daemon -> containerd -> runc -> Container

Сейчас (CRI):
Kubelet -> (CRI gRPC) -> containerd -> runc -> Container
            </div>
            <p class="mt-2">Удаление Docker (dockershim) убрало лишнюю прослойку. <code>containerd</code> (который был внутри Docker) теперь используется напрямую. Это стабильнее и меньше потребляет ресурсов.</p>
            <p class="mt-2"><strong>Альтернатива: CRI-O.</strong> Это другая популярная реализация CRI (от Red Hat). В отличие от containerd, который является универсальным, CRI-O создан специально и <em>только</em> для Kubernetes. Он еще легче и строго следует стандартам OCI. Для K8s нет разницы, что использовать — оба работают через CRI.</p>`,
        tip: "Не говорите 'Docker плохой'. Скажите 'Docker — это инструмент для разработки, а containerd/CRI-O — это оптимизированные рантаймы для продакшена'."
      },
      {
        q: "Что такое Admission Controllers и когда они срабатывают?",
        a: `<p>Это плагины внутри API Server, которые перехватывают запрос <strong>после аутентификации, но перед записью в Etcd</strong>.</p>
            <ul class="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Mutating (Изменяющие):</strong> Меняют объект. Пример: <code>LimitRanger</code> (ставит дефолтные лимиты), <code>Istio Sidecar Injector</code> (добавляет контейнер envoy).</li>
                <li><strong>Validating (Проверяющие):</strong> Говорят "Да" или "Нет". Пример: проверка схемы, проверка политик (OPA Gatekeeper/Kyverno).</li>
            </ul>
            <p class="mt-2 text-sm bg-gray-100 p-2 rounded">Порядок: Auth -> Mutating -> Schema Validation -> Validating -> Etcd Write</p>`,
        tip: "Приведите пример с 'Sidecar Injection' — это классический use-case для Mutating Webhook, который всем понятен."
      }
    ]
  },
  {
    id: 'm2', title: '2. Сетевая подсистема', desc: 'CNI, Kube-proxy, Ingress',
    questions: [
      {
        q: "CNI (Calico) vs Ingress: четкое разделение ответственности",
        a: `<p>Эти компоненты работают на разных уровнях модели OSI.</p>
            <ul class="list-disc pl-5 space-y-2">
                <li><strong>CNI (Network Plugin):</strong> Отвечает за <strong>L3/L4</strong> связность "Pod-to-Pod". Он выдает IP-адреса подам, настраивает маршрутизацию между нодами и применяет Network Policies. Без CNI поды не увидят друг друга.</li>
                <li><strong>Ingress (Controller):</strong> Отвечает за <strong>L7</strong> (HTTP/HTTPS) маршрутизацию "External-to-Service". Он "читает" заголовки Host и Path и направляет трафик. Ingress не может работать без CNI.</li>
            </ul>`,
        tip: "CNI — это дороги и провода (инфраструктура). Ingress — это регулировщик на въезде (правила доступа)."
      },
      {
        q: "Почему Cilium и eBPF считаются революцией в мире CNI?",
        a: `<p>Традиционные CNI (Flannel, Calico в стандартном режиме) часто используют <strong>iptables</strong> для маршрутизации и NAT. При масштабах в тысячи сервисов iptables становится узким местом из-за последовательного перебора правил.</p>
            <p><strong>Cilium</strong> использует технологию <strong>eBPF</strong> (Extended Berkeley Packet Filter):</p>
            <ul class="list-disc pl-5 space-y-2 mt-2">
                <li><strong>Kernel Level Performance:</strong> Программы eBPF запускаются в песочнице внутри ядра Linux. Пакетам не нужно проходить через тяжеловесный сетевой стек TCP/IP для простой переадресации, что дает производительность близкую к "голому железу".</li>
                <li><strong>Без iptables:</strong> Cilium заменяет гигантские таблицы правил на эффективные хэш-мапы eBPF.</li>
                <li><strong>L7 Observability:</strong> Благодаря eBPF, Cilium видит не только IP-пакеты, но и понимает протоколы приложений (HTTP, gRPC, Kafka, DNS), позволяя строить карту взаимодействий (Hubble) без внедрения Sidecar-контейнеров.</li>
            </ul>`,
        tip: "Если вас спросят про 'Service Mesh без сайдкаров' (Sidecar-less), они имеют в виду именно возможности Cilium Service Mesh."
      },
      {
        q: "Как работает Kube-proxy и режимы (iptables vs IPVS)?",
        a: `<p><strong>Kube-proxy</strong> реализует абстракцию Service. Он запускается на каждой ноде и настраивает правила переадресации трафика.</p>
            <ul class="list-disc pl-5 space-y-2">
                <li><strong>iptables (Stable):</strong> Для каждого сервиса создает цепочку правил O(n). При тысячах сервисов таблица становится огромной, и процессор тратит время на последовательный перебор правил для каждого пакета. Медленное обновление.</li>
                <li><strong>IPVS (Performance):</strong> Использует хэш-таблицы в ядре Linux O(1). Поиск маршрута почти мгновенный, независимо от числа сервисов. Поддерживает сложные алгоритмы балансировки (Least Connection и др.).</li>
            </ul>`,
        tip: "В крупных кластерах IPVS обязателен. Но современные CNI (как Cilium) могут полностью заменять kube-proxy, используя eBPF."
      },
      {
        q: "В чем разница между Overlay (VXLAN) и Flat (BGP) сетью?",
        a: `<p><strong>Overlay (VXLAN/IPIP):</strong> Инкапсуляция. Пакет пода заворачивается в пакет ноды. Работает поверх любой сети, но есть оверхед (MTU, CPU). Проще в настройке, не требует доступа к физическим роутерам.</p>
            <p><strong>Flat (BGP/Calico):</strong> Без инкапсуляции. Поды имеют реальные маршрутизируемые IP, доступные из сети организации. Ноды анонсируют маршруты физическим роутерам по BGP. Быстрее, проще отлаживать, но требует настройки физической сети.</p>`,
        tip: "Главная проблема Overlay сетей — MTU. Заголовок инкапсуляции отнимает байты (обычно 50 байт для VXLAN), что может вызывать проблемы с 'зависающими' соединениями, если не настроить MSS Clamping."
      },
      {
        q: "externalTrafficPolicy: Cluster vs Local. В чем разница?",
        a: `<p>Этот параметр определяет, как трафик с NodePort/LoadBalancer доходит до пода.</p>
            <ul class="list-disc pl-5 space-y-2">
                <li><strong>Cluster (Default):</strong> Трафик приходит на любую ноду. Если пода там нет, нода пересылает (SNAT) пакет на другую ноду, где есть под.
                    <br><em>Плюс:</em> Равномерное распределение нагрузки.
                    <br><em>Минус:</em> Потеря реального Client IP (под видит IP ноды) и лишний сетевой хоп.</li>
                <li><strong>Local:</strong> Трафик принимается только той нодой, где реально запущен под. Если пода нет — пакет дропается (через Health Check балансировщика).
                    <br><em>Плюс:</em> Сохраняется Client IP (нет SNAT) и меньше задержка.
                    <br><em>Минус:</em> Неравномерная нагрузка (если на одной ноде 1 под, а на другой 5 — первая получит меньше трафика, либо трафик пойдет только на "живые" ноды).</li>
            </ul>`,
        tip: "Для Ingress контроллеров всегда ставьте `externalTrafficPolicy: Local`, чтобы видеть реальные IP пользователей в логах доступа."
      },
      {
        q: "X-Forwarded-For header: что это и как связано с externalTrafficPolicy?",
        a: `<p><strong>X-Forwarded-For (XFF)</strong> — это HTTP-заголовок, в который прокси/балансировщики записывают реальный IP клиента.</p>
            <p><strong>Связь с externalTrafficPolicy:</strong></p>
            <ul class="list-disc pl-5 mt-2 space-y-1">
                <li>Если <code>externalTrafficPolicy: Cluster</code>: K8s делает SNAT, скрывая IP клиента на уровне TCP. Приложение видит внутренний IP. Чтобы узнать, кто пришел, приложение <em>обязано</em> читать заголовок <code>X-Forwarded-For</code> (если его добавил Ingress/LB).</li>
                <li>Если <code>externalTrafficPolicy: Local</code>: K8s не делает SNAT. Приложение видит реальный IP клиента прямо в TCP-сокете. <code>X-Forwarded-For</code> становится менее критичным для определения IP (но все еще полезен, если есть цепочка прокси).</li>
            </ul>
            <p class="mt-2 text-sm bg-yellow-50 p-2 rounded border border-yellow-100"><strong>Security & Spoofing:</strong> Никогда не доверяйте XFF бездумно. Злоумышленник может отправить <code>curl -H "X-Forwarded-For: 127.0.0.1"</code>. Доверять можно только если ваш внешний периметр (Ingress/WAF) принудительно стирает входящий XFF и пишет свой верный заголовок.</p>`,
        tip: "X-Forwarded-For - это Layer 7. externalTrafficPolicy - это Layer 4. Понимание разницы отличает Junior от Middle."
      },
      {
        q: "Зачем нужен hostNetwork: true?",
        a: `<p>Под с <code>hostNetwork: true</code> использует сетевой стек хоста (ноды), а не свой изолированный Namespace.</p>
            <ul class="list-disc pl-5 mt-2 space-y-1">
                <li><strong>IP адрес:</strong> IP пода = IP ноды.</li>
                <li><strong>Порты:</strong> Если под слушает порт 80, он занимает порт 80 на всей ноде.</li>
                <li><strong>Зачем:</strong> Нужно для системных компонентов (CNI плагины, kube-proxy, Ingress Controller для производительности), чтобы видеть реальный сетевой трафик.</li>
                <li><strong>Риск:</strong> Конфликт портов (нельзя запустить 2 таких пода на одной ноде) и безопасность (доступ к loopback хоста).</li>
            </ul>`,
        tip: "Никогда не используйте `hostNetwork: true` для обычных бизнес-приложений. Это считается грубой ошибкой безопасности и архитектуры."
      },
      {
        q: "What are Kubernetes Network Policies and how do they differ from firewall rules?",
        a: `<p><strong>Network Policies (NetPol)</strong> — это нативный механизм K8s для сегментации трафика между подами.</p>
            <ul class="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Не IP, а Метки:</strong> Традиционные Firewall работают с IP-адресами/подсетями. NetPol использует <strong>Labels (Selectors)</strong>. Поскольку IP подов постоянно меняются, правила на основе меток (например, <code>app: db</code> разрешено только для <code>app: backend</code>) гораздо надежнее.</li>
                <li><strong>Default Allow:</strong> По умолчанию в K8s любой под может говорить с любым. Создание NetPol меняет режим на "все запрещено, кроме разрешенного".</li>
                <li><strong>Реализация через CNI:</strong> Сами по себе правила NetPol ничего не делают. Их исполняет CNI плагин (Calico, Cilium). Если ваш CNI (например, простой Flannel) не поддерживает политики, они будут игнорироваться.</li>
            </ul>`,
        tip: "Это критический компонент безопасности (Zero Trust). Без NetworkPolicies, один взломанный под дает доступ ко всему кластеру."
      }
    ]
  },
  {
    id: 'm3', title: '3. Хранение данных (Storage)', desc: 'PV, PVC, RWX',
    questions: [
      {
        q: "В чем физическая разница между RWO и RWX режимами?",
        a: `<p>Это ограничение не Kubernetes, а технологии хранения.</p>
            <ul class="list-disc pl-5 space-y-2">
                <li><strong>RWO (ReadWriteOnce) — Block Storage:</strong> Аналог физического жесткого диска (AWS EBS, Google Persistent Disk). Диск можно подключить (mount) только к <strong>одному</strong> серверу за раз. Файловая система (ext4/xfs) не рассчитана на одновременную запись с двух серверов — это приведет к коррупции данных.</li>
                <li><strong>RWX (ReadWriteMany) — File Storage:</strong> Аналог сетевой папки (NFS, CephFS, AWS EFS). Доступ идет по сетевому протоколу, который управляет блокировками файлов. Множество подов на разных нодах могут писать одновременно.</li>
            </ul>`,
        tip: "Не пытайтесь монтировать EBS (RWO) диск к двум подам на разных нодах — под просто застрянет в статусе ContainerCreating."
      },
      {
        q: "Как Longhorn (или другой CSI) реализует RWX на блочных устройствах?",
        a: `<p>Longhorn изначально создает RWO (блочный) том.</p>
            <p>Для RWX он использует трюк:
            1. Запускает специальный системный под ("Share Manager").
            2. Монтирует RWO том к этому поду.
            3. Внутри пода запускает <strong>NFS Server</strong> (Ganesha).
            4. Остальные поды в кластере монтируют этот ресурс как обычный NFS клиент.</p>
            <p>Это добавляет оверхед, но позволяет получить RWX без внешнего NAS.</p>`,
        tip: "Это работает, но производительность будет ниже, чем у нативного решения. Для высоких нагрузок на запись RWX через NFS-bridge может стать узким местом."
      },
      {
        q: "PV vs PVC. В чем разница?",
        a: `<p><strong>PV (PersistentVolume):</strong> Кусок физического хранилища (диск AWS, NFS шара). Ресурс кластера, как CPU или RAM. Создается админом или автоматически.</p>
            <p><strong>PVC (PersistentVolumeClaim):</strong> Заявка (запрос) на хранилище от пользователя. "Мне нужно 10Гб быстрого диска".</p>
            <p>Поды используют PVC. PVC связывается (bind) с подходящим PV. Это разделяет ответственность: админ/облако дает PV, разработчик просит PVC.</p>`,
        tip: "Всегда используйте StorageClass и Dynamic Provisioning. Создавать PV вручную в 2024 году — моветон, если только это не специфический NFS/Local storage."
      }
    ]
  },
  {
    id: 'm4', title: '4. Жизненный цикл (Lifecycle)', desc: 'Probes, Hooks',
    questions: [
      {
        q: "Liveness vs Readiness Probe: когда какая нужна?",
        a: `<p>Разные действия при провале проверки (Failure):</p>
            <ul class="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Liveness (Жив?):</strong> Если FAIL -> Kubelet делает <strong>RESTART</strong> контейнера.
                    <br><em>Use Case:</em> Приложение зависло (Deadlock), не отвечает на запросы, но процесс висит. Только рестарт поможет.</li>
                <li><strong>Readiness (Готов?):</strong> Если FAIL -> Kubelet <strong>убирает IP пода из Endpoints</strong> (трафик перестает идти). Под продолжает работать.
                    <br><em>Use Case:</em> Приложение загружается, прогревает кэш, или перегружено запросами. Рестарт тут навредит, нужно просто дать время.</li>
            </ul>`,
        tip: "Золотое правило: Никогда не ставьте Liveness Probe на внешнюю зависимость (например, проверять коннект к БД). Если БД упадет, весь ваш кластер уйдет в бесконечный ребут."
      },
      {
        q: "Почему при обновлении приложения (RollingUpdate) пользователи получают 502 ошибки?",
        a: `<p>Проблема в асинхронности процессов удаления.</p>
            <ol class="list-decimal pl-5 space-y-1">
                <li>Kubelet шлет SIGTERM пода. Приложение закрывает сокет.</li>
                <li>Параллельно Endpoint Controller удаляет IP из списка.</li>
                <li>Ingress Controller получает обновление списка IP и делает reload конфига.</li>
            </ol>
            <p>Этот процесс не мгновенный. Ingress может продолжать слать трафик в уже закрывающийся под.</p>
            <p><strong>Решение:</strong> <code>preStop hook</code> с командой <code>sleep 5-10</code>. Под остается в статусе Terminating, но продолжает принимать соединения, давая время Ingress'у обновить таблицы.</p>`,
        tip: "Также убедитесь, что ваше приложение корректно обрабатывает SIGTERM (Graceful Shutdown), дожидаясь завершения текущих запросов перед выходом."
      },
        {
        q: "Init Containers vs Sidecars",
        a: `<p><strong>Init Containers:</strong> Запускаются <em>до</em> основного контейнера. Должны успешно завершиться. Используются для миграций БД, скачивания конфигов, ожидания зависимостей.</p>
            <p><strong>Sidecars:</strong> Запускаются <em>вместе</em> с основным контейнером. Работают параллельно. Используются для проксирования трафика (Istio), сбора логов, обновления конфигураций.</p>`,
        tip: "Init контейнеры блокируют запуск пода. Если init-контейнер упадет или зависнет, основной контейнер никогда не стартанет."
      }
    ]
  },
  {
    id: 'm5', title: '5. Access Control & Governance', desc: 'RBAC, Service Accounts, Quotas',
    questions: [
      {
        q: "В чем принципиальная разница между Role и ClusterRole в RBAC?",
        a: `<p>Оба объекта определяют набор разрешений (rules), но отличаются областью применения (scope):</p>
            <ul class="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Role:</strong> Разрешения действуют только в пределах одного <strong>Namespace</strong>. Например, 'Разрешено читать поды только в ns: prod'.</li>
                <li><strong>ClusterRole:</strong> Разрешения действуют на уровне всего <strong>Кластера</strong>. Используется для:
                    <br>а) Доступа к кластерным ресурсам (Nodes, PV, ClusterRoleBindings).
                    <br>б) Доступа к ресурсам во <strong>всех</strong> Namespace (например, 'Читать поды во всех NS').</li>
            </ul>
            <p class="mt-2"><strong>Принцип Bind:</strong> Role/ClusterRole связывается с пользователем/группой/ServiceAccount через <strong>RoleBinding</strong> (для Role) или <strong>ClusterRoleBinding</strong> (для ClusterRole).</p>`,
        tip: "Избегайте использования ClusterRoleBindings, если Role может работать. Давайте пользователям наименьший необходимый уровень доступа (Principle of Least Privilege)."
      },
      {
        q: "Как ServiceAccount связан с RBAC и для чего он нужен?",
        a: `<p><strong>ServiceAccount (SA)</strong> — это "личность" не для человека, а для <strong>процессов, запущенных внутри подов</strong> (например, для контроллеров или CI/CD агентов).</p>
            <ul class="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Автоматическое монтирование:</strong> При создании пода, если не указано иное, под получает токен ServiceAccount по умолчанию.</li>
                <li><strong>RBAC:</strong> SA — это субъект, на который накладываются разрешения через RoleBinding. Например, оператор должен иметь права на создание Secret'ов. Мы создаем SA, даем ему Role и связываем их через RoleBinding.</li>
            </ul>`,
        tip: "В продакшене всегда создавайте выделенный ServiceAccount для каждого приложения и связывайте его с минимально необходимой Role. Использование 'default' SA — плохая практика."
      }
    ]
  },
  {
    id: 'm6', title: '6. Конфигурация и Безопасность', desc: 'Secrets, Env',
    questions: [
          {
            q: "Secret vs ConfigMap: безопасны ли Secret?",
            a: `<p>Нет, не "из коробки".</p>
                <ul class="list-disc pl-5 mt-2 space-y-1">
                    <li><strong>Base64:</strong> Это кодировка, а не шифрование. Любой, у кого есть доступ к API (RBAC), может декодировать их.</li>
                    <li><strong>Encryption at Rest:</strong> По умолчанию в etcd они лежат открытым текстом. Нужно включать EncryptionConfiguration на API сервере, чтобы шифровать их перед записью на диск.</li>
                    <li><strong>Внутри пода:</strong> Они монтируются как tmpfs (в памяти), на диск не пишутся. Но root внутри контейнера (или через exec) может их прочитать.</li>
                </ul>`,
            tip: "Обязательно упомяните 'Encryption at Rest' и внешние хранилища секретов (Vault/SealedSecrets), чтобы показать Senior подход."
        },
        {
            q: "Я хочу передать Secret через переменную окружения. В чем минус?",
            a: `<p>Минус в невозможности обновления "на лету".</p>
                <p>Если вы меняете Secret в K8s, переменная окружения в уже запущенном процессе <strong>не изменится</strong>. Процесс читает <code>env</code> только при старте (<code>fork/exec</code>). Чтобы применить новый пароль, нужно делать <code>rollout restart</code> (пересоздать поды).</p>
                <p>При монтировании файлом (Volume), файл обновляется автоматически, и приложение может его перечитать.</p>`,
            tip: "Переменные окружения также видны в логах при ошибках и в дампах процессов. Файловое монтирование считается более безопасным."
        }
    ]
  },
  {
    id: 'm7', title: '7. Администрирование узлов', desc: 'Drain, Cordon',
    questions: [
        {
            q: "Я делаю drain ноды, но он завис. Почему?",
            a: `<p>Самые частые причины:</p>
                <ol class="list-decimal pl-5 mt-2 space-y-1">
                    <li><strong>PDB (Pod Disruption Budget):</strong> Вы запретили ронять последние реплики. Если <code>minAvailable: 1</code> и у вас всего 1 под, drain будет ждать вечно.</li>
                    <li><strong>Локальные данные (LocalStorage):</strong> Если под использует <code>emptyDir</code> (не в памяти) или <code>hostPath</code>, K8s боится удалять под, так как данные будут уничтожены. Нужен флаг <code>--delete-emptydir-data</code>.</li>
                    <li><strong>DaemonSets:</strong> Контроллер DaemonSet тут же перезапустит под обратно. Drain требует флага <code>--ignore-daemonsets</code>.</li>
                </ol>`,
            tip: "Начните ответ с PDB. Это самая 'архитектурная' причина."
        },
        {
            q: "Чем Cordon отличается от Drain?",
            a: `<p><strong>Cordon</strong> — это просто "Знак 'Кирпич'". Он вешает Taint <code>NoSchedule</code>. Новые поды не придут, старые продолжат жить. Используется для быстрого траблшутинга.</p>
                <p><strong>Drain</strong> — это "Эвакуация". Он делает Cordon, а затем активно удаляет (Evict) поды с ноды, заставляя их переехать на другие ноды.</p>`,
            tip: "Используйте Cordon, когда хотите перегрузить сервис на ноде без миграции всех подов. Используйте Drain, когда выключаете ноду на обслуживание."
        }
    ]
  },
  {
    id: 'm8', title: '8. Scaling & Scheduling', desc: 'HPA, VPA, Affinity, Taints',
    questions: [
      {
        q: "Опиши принцип работы HPA (Horizontal Pod Autoscaler). Какие метрики используются?",
        a: `<p>HPA автоматически масштабирует количество реплик Deployment, ReplicaSet или StatefulSet (изменяет поле <code>replicas</code>) на основе наблюдаемых метрик.</p>
            <ul class="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Цель:</strong> Поддерживать среднее значение метрики (например, 50% CPU Usage) на заданном уровне.</li>
                <li><strong>Алгоритм:</strong> HPA регулярно опрашивает API (через Metrics Server) и вычисляет Desired Replicas:
                    <br><code>Desired = ceil[Current Replicas * (Current Metric / Desired Metric)]</code></li>
                <li><strong>Метрики:</strong>
                    <br>1. Resource Metrics (CPU, Memory - требуют Metrics Server).
                    <br>2. Custom Metrics (QPS, Latency - требуют Prometheus/Adapter).</li>
            </ul>`,
        tip: "HPA борется с 'Horizontal' нагрузкой (рост числа запросов), но не решает проблему 'Vertical' оптимизации (слишком мало RAM/CPU для одной реплики)."
      },
      {
        q: "В чем ключевое отличие HPA от VPA (Vertical Pod Autoscaler)?",
        a: `<p>Оба — автоскейлеры, но они оптимизируют разные параметры:</p>
            <ul class="list-disc pl-5 mt-2 space-y-1">
                <li><strong>HPA (Horizontal):</strong> Меняет <strong>количество реплик</strong> (масштабирование OUT/IN). Используется для stateless-приложений, где добавление реплик решает проблему.</li>
                <li><strong>VPA (Vertical):</strong> Меняет <strong>Requests/Limits</strong> CPU и Memory для пода (масштабирование UP/DOWN). Используется для оптимизации использования ресурсов или для приложений, которые плохо масштабируются горизонтально.</li>
            </ul>
            <p class="mt-2"><strong>Конфликт:</strong> HPA и VPA не могут работать с одним и тем же ресурсом (например, CPU) одновременно, так как VPA может захотеть перезапустить под для применения новых Requests/Limits, а HPA не знает о новом оптимальном размере пода.</p>`,
        tip: "VPA не может менять ресурсы у запущенного пода. Он должен перезапустить под. Упомяните, что VPA может работать только в режиме 'Recommendation', чтобы не прерывать работу пода, пока HPA масштабирует."
      },
      {
        q: "Объясни концепции Taints и Tolerations. Зачем они нужны?",
        a: `<p>Это механизм, позволяющий предотвратить размещение подов на определенных нодах или зарезервировать ноды для системных/приоритетных подов.</p>
            <ul class="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Taint (Заражение):</strong> Применяется к <strong>Node</strong>. Отталкивает поды. По умолчанию поды не могут попасть на зараженную ноду.</li>
                <li><strong>Toleration (Толерантность):</strong> Применяется к <strong>Pod</strong>. Разрешает поду быть размещенным на ноде с соответствующим Taint.</li>
            </ul>
            <p class="mt-2"><strong>Пример:</strong> Нода с Taint <code>gpu=true:NoSchedule</code> будет принимать поды только с Toleration на <code>gpu=true</code>.</p>
            <h4 class="font-bold mt-2">Эффекты (Effect):</h4>
            <ul>
                <li><code>NoSchedule</code>: Новые поды не могут быть размещены.</li>
                <li><code>PreferNoSchedule</code>: Шедулер постарается избежать, но может разместить.</li>
                <li><code>NoExecute</code>: <strong>Удаляет</strong> уже запущенные поды и предотвращает запуск новых. (Используется для изоляции при проблемах с нодой).</li>
            </ul>`,
        tip: "Taint & Toleration — это <strong>исключающий</strong> механизм. Affinity/Selector — это <strong>включающий</strong> механизм."
      },
      {
        q: "Чем Affinity/Anti-affinity отличается от NodeSelector?",
        a: `<p>Оба используются для выбора нод, но Affinity дает гибкость и логику.</p>
            <ul class="list-disc pl-5 mt-2 space-y-1">
                <li><strong>NodeSelector:</strong> Простая, жесткая привязка. <code>key: value</code>. Если нет ноды с меткой, под не запустится (Pending).</li>
                <li><strong>Node Affinity:</strong> Более гибкая система.
                    <br>а) <code>requiredDuringSchedulingIgnoredDuringExecution</code> (жесткое требование)
                    <br>б) <code>preferredDuringSchedulingIgnoredDuringExecution</code> (мягкое предпочтение)</li>
                <li><strong>Pod Affinity/Anti-affinity:</strong> Позволяет размещать/разделять поды <strong>в зависимости от размещения других подов</strong>. Использует топологию (например, "Разместить пода X там же, где под Y" или "Не размещать более одного пода Z на одной ноде/зоне").</li>
            </ul>`,
        tip: "Pod Anti-affinity с топологией <code>topologyKey: kubernetes.io/hostname</code> — это классический способ обеспечить High Availability, распределяя реплики по разным нодам."
      }
    ]
  },
  {
    id: 'm9', title: '9. Packaging & Delivery', desc: 'Helm, Ingress Controllers',
    questions: [
      {
        q: "Что такое Helm, и в чем его отличие от 'plain' YAML манифестов?",
        a: `<p><strong>Helm</strong> — это пакетный менеджер для Kubernetes, который позволяет определять, устанавливать и обновлять приложения, используя шаблоны (Charts).</p>
            <p><strong>Отличие от plain YAML:</strong></p>
            <ul class="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Templating:</strong> Использует Go шаблоны (Tillerless/Helm 3) для генерации финального YAML. Это позволяет менять Image Tag, ConfigMap, Service Type и прочее без изменения исходных файлов.</li>
                <li><strong>Lifecycle Management:</strong> Позволяет откатывать (rollback) изменения, отслеживать версии (release history) и удалять приложения целиком, включая все связанные ресурсы.</li>
                <li><strong>Reusability:</strong> Один Chart может быть использован для установки приложения в Dev, Stage и Prod, меняя только файл <code>values.yaml</code>.</li>
            </ul>`,
        tip: "Обязательно назовите ключевые компоненты Chart: <code>Chart.yaml</code> (метаданные), <code>values.yaml</code> (конфигурация по умолчанию), <code>templates/</code> (Go шаблоны)."
      },
      {
        q: "Сравнение Ingress Controllers: Nginx vs Traefik. Какие архитектурные отличия?",
        a: `<p>Оба — L7 прокси, реализующие спецификацию Ingress, но имеют разный подход к обновлению конфигурации:</p>
            <ul class="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Nginx Ingress (Controller):</strong>
                    <br>1. <strong>Архитектура:</strong> Nginx как прокси, и отдельный Go-контроллер, который следит за K8s API.
                    <br>2. <strong>Обновление:</strong> При изменении Ingress Controller пишет новый Nginx конфиг и делает <strong>мягкий перезапуск</strong> (reload). Это занимает 1-2 секунды, может прервать Long-lived соединения.
                    <br>3. <strong>Плюс:</strong> Проверенный, быстрый Nginx, богатая функциональность через аннотации.</li>
                <li><strong>Traefik:</strong>
                    <br>1. <strong>Архитектура:</strong> Написан на Go, является одновременно и контроллером, и прокси.
                    <br>2. <strong>Обновление:</strong> Обновляет роутинг <strong>в памяти</strong> (Hot Reload). Обновление происходит мгновенно, без разрыва соединений.
                    <br>3. <strong>Плюс:</strong> Более нативный для K8s, мгновенный Hot Reload, встроенный Dashboard.</li>
            </ul>`,
        tip: "Если вам нужна L7-функциональность Service Mesh (канареечные релизы, mTLS) — Ingress не справится. Тут нужен Envoy или Istio Gateway."
      }
    ]
  }
];

const SENIOR_MODULES = [
  {
    "id": "s1",
    "title": "1. Внутренности Архитектуры",
    "desc": "Architect Level: Informers, Leader Election, APF",
    "questions": [
      {
        "q": "Что такое Informer и Reflector в client-go и зачем они нужны? Опиши внутренний цикл.",
        "a": `<p>Это паттерн оптимизации, предотвращающий падение API-сервера от поллинга. Стандартная цепочка реализации контроллера выглядит так:</p>
            <ul class="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Reflector:</strong> Выполняет первичный <code>List</code> и затем поддерживает длинное соединение <code>Watch</code>, получая поток событий. Полученные объекты помещаются в очередь <strong>DeltaFIFO</strong>, которая дедуплицирует и сжимает события (если объект изменился 5 раз, останется только актуальное состояние).</li>
                  <li><strong>Informer:</strong> Забирает объекты из DeltaFIFO и обновляет <strong>локальный кэш</strong> (Indexer/ThreadSafeStore). Только после обновления кэша вызываются Event Handlers (OnAdd, OnUpdate) вашей бизнес-логики.</li>
              </ul>
              <p><strong>Результат:</strong> Reconcile loop читает данные из локальной памяти мгновенно, не нагружая сеть и etcd.</p>`,
        "tip": "Упомяните 'SharedInformerFactory'. Этот механизм позволяет сотням контроллеров (внутри одного бинарника) использовать один и тот же Reflector/Connection и общий кэш, экономя гигабайты RAM."
  },
      {
        "q": "Как работает Leader Election в Control Plane компонентах?",
        "a": `<p>Для обеспечения HA (High Availability) запускается несколько реплик Scheduler или Controller Manager, но активной должна быть только одна.</p>
              <h4 class="font-bold mt-2">Алгоритм Optimistic Locking:</h4>
            <ol class="list-decimal pl-5 mt-2 space-y-1">
                  <li>Используется объект <code>Lease</code> в Kubernetes (обычно в <code>kube-system</code>).</li>
                  <li>Кандидаты пытаются отправить PUT-запрос, обновляя поле <code>holderIdentity</code> и время.</li>
                  <li><strong>CAS (Compare-And-Swap):</strong> API-сервер проверяет <code>resourceVersion</code>. Если версия в базе совпадает с тем, что прислал кандидат — запись обновляется, кандидат становится лидером.</li>
                  <li>Если другой кандидат успел раньше, версия изменилась, и API вернет 409 Conflict. Проигравший переходит в режим ожидания.</li>
            </ol>`,
        "tip": "В отличие от Zookeeper/Etcd lock, здесь не нужны тяжелые сессии. Используются нативные примитивы версионирования K8s ресурсов."
      },
      {
        "q": "Как работает API Priority and Fairness (APF)?",
        "a": `<p>APF защищает Control Plane от перегрузки (например, DDoS от собственных сломанных контроллеров).</p>
              <ul class="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>FlowSchema:</strong> Классифицирует входящие запросы (кто пришел? system:nodes, admin или service-account?).</li>
                  <li><strong>PriorityLevelConfiguration:</strong> Направляет запрос в соответствующую очередь. Каждый уровень имеет свой <strong>Concurrency Limit</strong> (лимит одновременно выполняемых запросов).</li>
                  <li><strong>Isolation:</strong> Используется техника <em>Shuffle Sharding</em>, чтобы "шумный сосед" (один нагруженный тенант) не забил всю очередь, и запросы других тенантов того же приоритета проходили.</li>
              </ul>`,
        "tip": "Если вы видите ошибки 429 Too Many Requests в логах контроллеров, не спешите добавлять CPU API-серверу. Проверьте метрики APF — возможно, нужно расширить очереди для конкретной FlowSchema."
      }
    ]
  },
  {
    "id": "s2",
    "title": "2. Ядро Linux и Ресурсы",
    "desc": "Cgroups, OOM Score Math, CPU Manager",
    "questions": [
      {
        "q": "Как CPU Requests и Limits реализованы в ядре Linux? В чем опасность Limits?",
        "a": `<p>Kubernetes транслирует ресурсы в настройки <strong>Cgroups</strong>:</p>
              <ul class="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Requests (cpu.shares):</strong> Это "мягкий" вес. Он гарантирует долю процессора <em>только</em> в моменты 100% загрузки ноды. Если нода свободна, контейнер может использовать все свободные циклы выше реквеста.</li>
                  <li><strong>Limits (cpu.cfs_quota_us):</strong> "Жесткий" лимит планировщика CFS. Задает квоту времени (обычно на период 100мс). Если процесс исчерпал квоту, ядро <strong>принудительно приостанавливает</strong> (Throttling) его до следующего периода. Это вызывает latency даже на простаивающем сервере.</li>
              </ul>`,
        "tip": "Для latency-sensitive приложений (Java, DB) часто рекомендуют не ставить CPU Limits (или ставить с большим запасом), оставляя только Requests, чтобы избежать троттлинга CFS."
      },
      {
        "q": "Как OOM Killer выбирает жертву? (Математика OOM Score)",
        "a": `<p>Ядро убивает процессы с высоким <code>oom_score</code>. Kubelet манипулирует этим через <code>oom_score_adj</code> (-1000 до +1000):</p>
              <ul class="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Guaranteed:</strong> Значение <strong>-998</strong>. Убиваются последними (после системных процессов).</li>
                  <li><strong>BestEffort:</strong> Значение <strong>1000</strong>. Первые кандидаты на смерть.</li>
                  <li><strong>Burstable:</strong> Рассчитывается динамически по формуле:
                      $$score = 1000 - \left( \frac{1000 \times memoryRequest}{machineCapacity} \right)$$
                      Чем большую часть памяти ноды вы гарантированно зарезервировали (Request), тем ниже (безопаснее) ваш score.</li>
              </ul>`,
        "tip": "Важно отличать Node OOM (убивает ядро) от Eviction (Kubelet мягко изгоняет поды). Kubelet пытается сработать раньше ядра, чтобы сохранить стабильность системы."
      },
      {
        "q": "Что такое 'Static' CPU Manager Policy и зачем она нужна?",
        "a": `<p>По умолчанию процессы прыгают по всем ядрам CPU, вызывая переключение контекста и очистку кэша процессора (Cache Misses).</p>
              <p>Политика <strong>Static</strong> позволяет выделить поду <strong>эксклюзивные физические ядра</strong>.</p>
              <p><strong>Требования:</strong></p>
              <ul class="list-disc pl-5 mt-2 space-y-1">
                  <li>Под должен быть в классе QoS <strong>Guaranteed</strong>.</li>
                  <li>Запрос CPU должен быть <strong>целым числом</strong> (например, <code>cpu: 2</code>, а не <code>2.5</code>).</li>
              </ul>
              <p>В этом случае Kubelet изменяет <code>cpuset</code> cgroup, физически изолируя ядра под этот контейнер.</p>`,
        "tip": "Критично для High-Performance Computing (HPC) и приложений реального времени (Telco), где важна локальность L1/L2 кэша."
      }
    ]
  },
  {
    "id": "s3",
    "title": "3. Безопасность и CNI Advanced",
    "desc": "Exec Protocol, CNI Chaining, PSA, OIDC",
    "questions": [
      {
        "q": "Как технически работает `kubectl exec`? Эволюция протоколов.",
        "a": `<p>Это не SSH, а цепочка соединений, где API Server выступает прокси.</p>
              <div class="bg-slate-800 text-white p-4 rounded text-sm font-mono my-2 whitespace-pre-wrap">
Kubectl -> API Server -> Kubelet -> CRI -> Container Namespace
              </div>
              <p><strong>Протоколы:</strong></p>
              <ul class="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Исторически:</strong> Использовался SPDY (устаревший стандарт Google, предок HTTP/2).</li>
                  <li><strong>Современность (v1.30+):</strong> Kubernetes перешел на стандартные <strong>WebSockets</strong>. Клиент отправляет заголовок <code>Upgrade: websocket</code>. Это решает проблемы совместимости с корпоративными прокси, которые часто блокировали SPDY.</li>
              </ul>`,
        "tip": "Если `kubectl exec` зависает или обрывается, проверьте настройки вашего Ingress/LoadBalancer — поддерживают ли они WebSocket Upgrade и длинные тайм-ауты соединения."
      },
      {
        "q": "Что такое CNI Chaining?",
        "a": `<p>Спецификация CNI позволяет комбинировать несколько плагинов в цепочку для одного интерфейса. Конфигурация <code>.conflist</code> выполняется последовательно:</p>
              <ol class="list-decimal pl-5 mt-2 space-y-1">
                  <li><strong>Base Plugin (AWS VPC / Calico):</strong> Создает veth-пару, назначает IP, настраивает роутинг.</li>
                  <li><strong>Meta Plugin (Portmap):</strong> Настраивает iptables правила для реализации <code>hostPort</code>.</li>
                  <li><strong>Tuning Plugin:</strong> Применяет sysctl параметры к интерфейсу.</li>
              </ol>
              <p>Результат работы одного плагина передается на вход следующему.</p>`,
        "tip": "Это частый паттерн. Например, Istio CNI встраивается в эту цепочку, чтобы настроить перехват трафика без использования init-контейнеров с привилегиями `NET_ADMIN`."
      },
      {
        "q": "В чем заключается проблема ndots:5 в DNS?",
        "a": `<p>По умолчанию <code>/etc/resolv.conf</code> в поде содержит <code>ndots:5</code>. Это означает, что любой домен с менее чем 5 точками считается "неполным".</p>
              <p><strong>Сценарий:</strong> Приложение резолвит <code>google.com</code> (1 точка).</p>
              <p><strong>Поведение:</strong> Резолвер сначала подставляет все search-домены:</p>
              <ul class="list-disc pl-5 mt-2 space-y-1">
                  <li><code>google.com.my-ns.svc.cluster.local</code> (NXDOMAIN)</li>
                  <li><code>google.com.svc.cluster.local</code> (NXDOMAIN)</li>
                  <li>...и так далее.</li>
              </ul>
              <p>Только в конце делается запрос к абсолютному имени. Это генерирует паразитный трафик на CoreDNS.</p>`,
        "tip": "Решение: используйте FQDN (с точкой в конце: <code>google.com.</code>) в коде приложения или настройте <code>dnsConfig</code> в спецификации Пода."
      },
      {
        "q": "Pod Security Admission (PSA) vs PSP: Как это работает?",
        "a": `<p>PSA — это встроенный контроллер, заменивший сложный PodSecurityPolicy. Он управляется исключительно через <strong>Labels на Namespace</strong>.</p>
              <h4 class="font-bold mt-2">Три стандарта (Profiles):</h4>
              <ul class="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Privileged:</strong> Полный доступ (для системных агентов, CSI).</li>
                  <li><strong>Baseline:</strong> Запрещает привилегированные контейнеры и хостовые порты/сети.</li>
                  <li><strong>Restricted:</strong> Самый строгий. Требует сброса всех Linux Capabilities, явной настройки Seccomp и запуска не от root (RunAsNonRoot).</li>
              </ul>`,
        "tip": "PSA — это простое 'коробочное' решение. Если вам нужна сложная логика (например, разрешить образы только из корпоративного реестра), вам все равно понадобится OPA Gatekeeper или Kyverno."
      },
      {
        "q": "Особенности OIDC аутентификации (Revocation Problem)",
        "a": `<p>API Server проверяет ID Token (JWT) как <strong>Stateless</strong> сервис. Он проверяет цифровую подпись и срок действия (exp), но <strong>не обращается</strong> к провайдеру (Google/Okta) при каждом запросе.</p>
              <p><strong>Проблема отзыва:</strong> Если сотрудника уволили и заблокировали в Okta, его токен продолжает работать в K8s до истечения времени жизни (обычно 1 час). Моментальный отзыв на уровне API-сервера невозможен.</p>`,
        "tip": "Для минимизации рисков используйте короткоживущие токены (Short TTL) в сочетании с механизмом Refresh Tokens на стороне клиента (kubelogin)."
      }
    ]
  },
  {
    "id": "s4",
    "title": "4. GitOps & Operators",
    "desc": "ArgoCD, Flux, Custom Controllers, Capability Levels",
    "questions": [
      {
        "q": "В каких случаях архитектурно оправдано написание собственного Kubernetes Operator? Объясни через модель зрелости (Capability Levels).",
        "a": `<p>Оператор — это контроллер, инкапсулирующий эксплуатационные знания (Operational Knowledge) в код. В отличие от Helm («отрендерить и забыть»), Оператор работает в бесконечном цикле согласования (Reconciliation Loop).</p>
              <h4 class="font-bold mt-2">Решение принимается по модели зрелости (Capability Levels):</h4>
              <ul class="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Level I-II (Install & Upgrade):</strong> Базовая установка. Здесь Helm эффективнее и проще.</li>
                  <li><strong>Level III (Full Lifecycle):</strong> Управление бэкапами и восстановлением. Helm не может инициировать бэкап по расписанию или восстановить кластер из S3 — это зона ответственности Оператора.</li>
                  <li><strong>Level IV-V (Insights & Auto Pilot):</strong> Автомасштабирование и самолечение (Self-healing) на основе глубоких метрик приложения (например, лаг репликации), а не просто CPU/RAM.</li>
              </ul>
              <h4 class="font-bold mt-2">Ключевые сценарии (Use Cases):</h4>
              <ul class="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Stateful Management:</strong> Сложная логика БД (PostgreSQL, Kafka). Оператор знает, как безопасно переключить Master-ноду, дождаться синхронизации WAL-логов и только потом обновить старый Master.</li>
                  <li><strong>Complex Stateless (Spark Operator):</strong> Оркестрация сложных задач, где нужно управлять драйверами и экзекьюторами, перезапускать их с умной политикой повторов и сохранять логи после завершения.</li>
                  <li><strong>Infrastructure as Data (Crossplane):</strong> Паттерн, когда создание CRD в кластере (например, <code>RDSInstance</code>) вызывает создание реальных ресурсов в облаке (AWS RDS) через API провайдера.</li>
              </ul>`,
        "tip": "Используйте гибридный подход: устанавливайте сам контроллер Оператора через Helm, а ресурсы приложения разворачивайте через CRD. Это стандарт индустрии (Prometheus, Datadog, Istio)."
      }
    ]
  },
  {
    "id": "s5",
    "title": "5. Service Mesh Deep Dive",
    "desc": "Istio, Envoy, mTLS, SDS, Observability",
    "questions": [
      {
        "q": "Объясните архитектуру Service Mesh (на примере Istio) и ключевую роль Envoy Sidecar в обеспечении mTLS и Observability.",
        "a": `<p>Istio реализует разделение на <strong>Control Plane</strong> (Istiod) и <strong>Data Plane</strong> (Envoy Proxy).</p>
              <h4 class="font-bold mt-2">Data Plane: Envoy Proxy</h4>
              <p>Envoy — это L7 прокси, работающий как <strong>Sidecar</strong> в каждом поде. Он работает вне процесса приложения (out-of-process), перехватывая весь трафик через iptables:</p>
              <ul class="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Observability:</strong> Envoy видит каждый пакет и автоматически генерирует «Золотые сигналы» (Latency, Traffic, Errors) и распределенные трейсы, добавляя заголовки <code>x-b3-traceid</code>.</li>
                  <li><strong>Traffic Management:</strong> Реализует канареечные релизы, Circuit Breaking и Retry политики прозрачно для кода.</li>
              </ul>
              <h4 class="font-bold mt-2">Control Plane (Istiod):</h4>
              <p>Это монолитный процесс, который конфигурирует прокси через протокол <strong>xDS</strong> (gRPC API). Изменения в Kubernetes (новые поды, сервисы) транслируются в конфигурацию Envoy в реальном времени без перезагрузки прокси.</p>`,
        "tip": "Ключевое преимущество — приложение не знает о существовании прокси. Это позволяет внедрять mTLS, трейсинг и сложный роутинг в Legacy-приложения (Brownfield deployment) без переписывания кода."
      },
      {
        "q": "Как Service Mesh (Istio) реализует mTLS и безопасную ротацию сертификатов (SDS)?",
        "a": `<p>Istio обеспечивает безопасность Zero Trust, используя механизм <strong>SDS (Secret Discovery Service)</strong>, чтобы избежать хранения ключей на диске.</p>
              <ol class="list-decimal pl-5 mt-2 space-y-1">
                  <li><strong>Identity (SPIFFE):</strong> Каждому ворклоаду присваивается уникальный ID: <code>spiffe://cluster.local/ns/prod/sa/frontend</code>.</li>
                  <li><strong>Генерация ключей:</strong> <em>Istio Agent</em> (в sidecar-контейнере) генерирует приватный ключ в памяти и отправляет запрос на подпись (CSR) в Control Plane (Istiod). <strong>Приватный ключ никогда не покидает под.</strong></li>
                  <li><strong>SDS Push:</strong> Istiod подписывает сертификат и возвращает его агенту. Агент передает его Envoy через локальный сокет.</li>
                  <li><strong>Горячая ротация:</strong> Envoy хранит сертификаты только в оперативной памяти. Перед истечением срока действия (обычно 24ч) агент повторяет процесс, и Envoy переключается на новый сертификат мгновенно, без разрыва соединений.</li>
              </ol>`,
        "tip": "SDS архитектурно безопаснее, чем монтирование Kubernetes Secrets (файлов), так как исключает риск кражи ключа с диска ноды и решает проблему ротации сертификатов без рестарта подов."
      }
    ]
  },
  {
    "id": "s6",
    "title": "6. Resiliency & Disaster Recovery",
    "desc": "Etcd Restore, Velero (CSI vs Kopia), RTO/RPO",
    "questions": [
      {
        "q": "Как производится резервное копирование и восстановление Etcd? В чем риски процедуры восстановления?",
        "a": `<p>Etcd — источник правды кластера. Его восстановление — деструктивная операция для Control Plane.</p>
              <h4 class="font-bold mt-2">Процесс Backup:</h4>
              <p>Выполняется <code>etcdctl snapshot save</code>. Это безопасно делать на работающем кластере (создается консистентный снимок BoltDB).</p>
              <h4 class="font-bold mt-2">Критический процесс Restore:</h4>
              <ul class="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Остановка API:</strong> Перед восстановлением <strong>обязательно</strong> нужно остановить все экземпляры <code>kube-apiserver</code>. Иначе API-сервер может записать закэшированные (несогласованные) данные обратно в базу, повредив состояние.</li>
                  <li><strong>Изоляция:</strong> Восстановление создает новый кластер. Необходимо сменить <code>--initial-cluster-token</code>, чтобы старые ноды не присоединились случайно.</li>
                  <li><strong>Последствия:</strong> Во время процедуры Control Plane полностью недоступен. Поды продолжат работать, но скейлинг и самолечение невозможны.</li>
              </ul>`,
        "tip": "Бэкап Etcd спасает конфигурацию ресурсов, но НЕ данные приложений (PV). После восстановления кластер вернется в прошлое: поды, созданные после бэкапа, станут «сиротами» (их Deployment'ов не будет в базе) и потребуют ручной чистки."
      },
      {
        "q": "Что такое Velero и чем отличаются методы бэкапа (CSI Snapshot vs File System Backup)?",
        "a": `<p><strong>Velero</strong> — стандарт де-факто для DR данных приложений (Persistent Volumes) и миграции ресурсов.</p>
              <h4 class="font-bold mt-2">Сравнение методов бэкапа:</h4>
              <ul class="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>CSI Snapshots (Native):</strong> Использует API облака (AWS EBS, Google PD) через <code>VolumeSnapshot</code> CRD.
                      <br><em>Плюсы:</em> Мгновенная скорость (низкий RPO), crash-consistency.
                      <br><em>Минусы:</em> Привязка к региону и провайдеру. Сложно перенести данные из AWS в Azure.</li>
                  <li><strong>File System Backup (Kopia/Restic):</strong> Агент считывает файлы с диска пода и копирует в S3. Современный Velero использует движок <strong>Kopia</strong>.
                      <br><em>Плюсы:</em> Универсальность. Позволяет миграцию On-Prem -> Cloud. Kopia поддерживает дедупликацию и сжатие.
                      <br><em>Минусы:</em> Нагружает CPU/RAM узла, медленнее на миллионах мелких файлов.</li>
              </ul>`,
        "tip": "Для максимальной надежности комбинируйте: CSI Snapshots для быстрого восстановления внутри региона (Day-to-day DR) и File System Backup для долгосрочного хранения и защиты от полной потери региона (Cross-region DR)."
      },
      {
        "q": "Как выбранная стратегия DR влияет на показатели RTO и RPO?",
        "a": `<p><strong>RTO (Recovery Time)</strong> — время простоя. <strong>RPO (Recovery Point)</strong> — потеря данных.</p>
              <h4 class="font-bold mt-2">Стратегии:</h4>
              <ul class="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Cold Backup (Velero/Etcd в S3):</strong>
                      <br>RPO: Высокий (зависит от расписания, напр. 24ч).
                      <br>RTO: Высокий (часы). Требуется поднять новый кластер и «налить» данные. Самый дешевый вариант.</li>
                  <li><strong>Pilot Light (Active/Passive):</strong>
                      <br>RPO: Средний (минуты). Асинхронная репликация на уровне хранилища (RDS Read Replica).
                      <br>RTO: Средний. Control Plane жив, нужно только отмасштабировать Data Plane.</li>
                  <li><strong>Active/Active (Multi-Cluster):</strong>
                      <br>RPO/RTO: Близятся к нулю. Требует синхронной репликации и глобального балансировщика (GSLB). Экстремально дорого и сложно.</li>
              </ul>`,
        "tip": "Не обещайте бизнесу Zero RPO/RTO без бюджета на Multi-region архитектуру. Velero — это отличное решение, но это всегда компромисс в пользу стоимости, а не скорости."
      }
    ]
  },
  {
    "id": "s7",
    "title": "7. Multi-Tenancy & Advanced Security",
    "desc": "vCluster, AppArmor v1.30, Kyverno vs Gatekeeper",
    "questions": [
      {
        "q": "Объясни разницу между 'Hard' и 'Soft' Multi-tenancy. Роль vCluster.",
        "a": `<p>Различие заключается в глубине изоляции ресурсов и Control Plane.</p>
              <h4 class="font-bold mt-2">Soft Multi-tenancy (Namespace Isolation):</h4>
              <p>Подходит для доверенных команд. Использует RBAC, NetworkPolicy и Quotas. <strong>Риск:</strong> Все тенанты делят одно ядро Linux и один API-сервер. Уязвимость ядра или перегрузка API затронет всех.</p>
              <h4 class="font-bold mt-2">Hard Multi-tenancy (Изоляция уровня ядра/API):</h4>
              <p>Необходима, когда тенанты не доверяют друг другу (SaaS).</p>
              <ul class="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>vCluster (Virtual Cluster):</strong> Решает проблему общего API-сервера. Запускает виртуальный K8s внутри пода хост-кластера. Тенант получает полные права (может создавать CRD, Namespaces), не влияя на хост.</li>
                  <li><strong>Runtime Isolation:</strong> Использование gVisor или Kata Containers для изоляции на уровне ядра.</li>
              </ul>`,
        "tip": "Для настоящей 'Hard' мультитеннантности недостаточно Namespaces. Современный эталон — это комбинация vCluster (изоляция логики) + gVisor (изоляция рантайма)."
      },
      {
        "q": "Как правильно настроить AppArmor в современных версиях Kubernetes (v1.30+)?",
        "a": `<p>AppArmor (механизм безопасности ядра Linux) ограничивает доступ процессов к файловой системе и сети. Важно учитывать изменение API.</p>
              <h4 class="font-bold mt-2">Критическое изменение (v1.30+):</h4>
              <p>Использование аннотаций (<code>container.apparmor...</code>) официально <strong>объявлено устаревшим (deprecated)</strong>. Теперь настройка производится через поле <code>securityContext</code>.</p>
              <div class="bg-slate-800 text-white p-4 rounded text-sm font-mono my-2 whitespace-pre-wrap">
# Правильная конфигурация (K8s 1.30+)
spec:
  securityContext:
    appArmorProfile:
      type: RuntimeDefault # или 'Localhost'
              </div>
              <p>Профиль <code>RuntimeDefault</code> блокирует множество векторов атак и рекомендуется как минимальный стандарт.</p>`,
        "tip": "Pod Security Standards (уровень Restricted) требуют явной настройки профилей AppArmor и Seccomp. Переходите на нативные поля спецификации, отказываясь от аннотаций, чтобы избежать техдолга."
      },
      {
        "q": "OPA Gatekeeper vs Kyverno: В чем ключевое архитектурное преимущество Kyverno?",
        "a": `<p>Оба инструмента — Policy Engines (Admission Controllers), но с разной философией.</p>
              <h4 class="font-bold mt-2">OPA Gatekeeper (Rego):</h4>
              <p>Использует язык <strong>Rego</strong>. Это мощный, универсальный язык, но с высоким порогом входа. Подходит для сложнейших корпоративных политик и кросс-системных проверок.</p>
              <h4 class="font-bold mt-2">Kyverno (K8s-native):</h4>
              <p>Использует YAML. Главное преимущество — <strong>Generation (Генерация)</strong>.</p>
              <ul class="list-disc pl-5 mt-2 space-y-1">
                  <li>Kyverno умеет не только валидировать, но и <strong>создавать</strong> ресурсы. Например, при создании нового Namespace он автоматически сгенерирует дефолтные <code>NetworkPolicy</code>, <code>ResourceQuota</code> и <code>RoleBinding</code>.</li>
                  <li>Это делает Kyverno идеальным инструментом для автоматизации настройки окружений (Soft Multi-tenancy) без написания сложных операторов.</li>
              </ul>`,
        "tip": "Выбирайте Kyverno, если вам нужно быстро автоматизировать рутину и вы не хотите учить Rego. Выбирайте OPA, если у вас уже есть экосистема политик на Rego вне Kubernetes."
      }
    ]
  },
  {
    "id": "s8",
    "title": "8. CI/CD & Supply Chain Security",
    "desc": "Tekton, ArgoCD Image Updater, Cosign",
    "questions": [
      {
        "q": "В чем архитектурное отличие Tekton от Jenkins? (Serverless vs Monolith)",
        "a": `<p>Tekton — это Kubernetes-native фреймворк, меняющий парадигму исполнения.</p>
              <ul class="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Jenkins (Monolith):</strong> Зависит от Master-узла, который хранит состояние и оркестрирует агентов. Мастер — узкое место и единая точка отказа.</li>
                  <li><strong>Tekton (Serverless):</strong> Состояние пайплайна хранится в <strong>etcd</strong> через CRD (TaskRun, PipelineRun). Нет "мастера".</li>
                  <li><strong>Pod-per-Task:</strong> Каждый шаг пайплайна запускается как отдельный Pod (контейнер). Это обеспечивает полную изоляцию зависимостей (нет конфликтов плагинов) и честное выделение ресурсов планировщиком K8s.</li>
              </ul>`,
        "tip": "Tekton сложнее в освоении (много YAML), но он идеально ложится в GitOps подход и масштабируется линейно с размером кластера."
      },
      {
        "q": "Как работает ArgoCD Image Updater? Стратегии обновления.",
        "a": `<p>Updater автоматизирует "Write-Back" фазу GitOps — запись новой версии образа обратно в конфигурацию.</p>
              <h4 class="font-bold mt-2">Ключевые стратегии:</h4>
              <ul class="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Write-Back Method:</strong> Предпочтителен метод <strong>Git</strong> (создает коммит в репозиторий), а не API (меняет объект в кластере), чтобы сохранить Git как источник истины.</li>
                  <li><strong>Update Strategy (Newest-Build):</strong> Не используйте <code>latest</code> (он мутабелен и кешируется). Стратегия <code>newest-build</code> смотрит на timestamp создания образа в реестре и обновляет тег в манифестах только на свежую сборку.</li>
              </ul>`,
        "tip": "Это позволяет CI-системе не иметь доступа к продуктовому кластеру (kubectl apply), а только пушить образы в реестр. ArgoCD Updater сам увидит новый образ и обновит Git-репозиторий."
      },
      {
        "q": "Как работает проверка подписей образов (Cosign/Sigstore)?",
        "a": `<p>Механизм защиты цепочки поставок от подмены артефактов.</p>
              <ol class="list-decimal pl-5 mt-2 space-y-1">
                  <li><strong>Signing (CI):</strong> После сборки CI подписывает образ закрытым ключом и загружает подпись в реестр как OCI-артефакт.</li>
                  <li><strong>Admission Control:</strong> В кластере работает контроллер (Kyverno или Policy Controller). При создании Пода он перехватывает запрос.</li>
                  <li><strong>Verification:</strong> Контроллер проверяет наличие валидной подписи в реестре.</li>
                  <li><strong>Mutation (TOCTOU Protection):</strong> Важно: контроллер часто заменяет тег образа (<code>:v1</code>) на его <strong>digest</strong> (<code>@sha256:...</code>), чтобы гарантировать, что запускается именно тот байт-код, который был проверен.</li>
              </ol>`,
        "tip": "Без мутации в дайджест существует теоретическая атака TOCTOU (Time-of-Check to Time-of-Use), когда образ подменяют в реестре между моментом проверки и моментом скачивания узлом."
      }
    ]
  },
  {
    "id": "s9",
    "title": "9. Observability Deep Dive",
    "desc": "VictoriaMetrics vs Prometheus, eBPF, Tracing",
    "questions": [
      {
        "q": "В чем архитектурные преимущества VictoriaMetrics перед Prometheus?",
        "a": `<p>Хотя VM совместима с PromQL, "под капотом" она решает проблемы масштабируемости Prometheus.</p>
              <ul class="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Storage (MergeTree):</strong> Использует структуру данных, вдохновленную ClickHouse. Данные пишутся в "парты", которые фоново сливаются и сжимаются. Это дает сжатие в 7-10 раз лучше, чем TSDB Prometheus.</li>
                  <li><strong>Performance:</strong> Оптимизирована под <strong>High Cardinality</strong> (большое число уникальных метрик, например, при ротации подов).</li>
                  <li><strong>Instant Snapshots:</strong> Благодаря структуре MergeTree, создание бэкапа — это создание hard-links на файлы, что происходит мгновенно и без блокировок.</li>
              </ul>`,
        "tip": "VictoriaMetrics изначально создавалась как Long-Term Storage (LTS), тогда как стандартный Prometheus плохо переваривает хранение данных дольше пары недель."
      },
      {
        "q": "eBPF vs Sidecars: Почему eBPF выигрывает в производительности?",
        "a": `<p>Традиционный Service Mesh (Sidecar) требует прокси (Envoy) в каждом поде.</p>
              <p><strong>Проблема Sidecar:</strong> Путь пакета удлиняется. Трафик должен пройти: App -> Kernel -> Sidecar -> Kernel -> Network. Это множественные переключения контекста (Context Switches) и копирование памяти.</p>
              <p><strong>Преимущество eBPF:</strong> Программа eBPF работает в песочнице внутри ядра Linux. Она обрабатывает пакеты сразу на сетевом интерфейсе.
              <br>Результат: <strong>Zero Instrumentation</strong> (не нужно менять поды) и отсутствие накладных расходов на переключение контекста в User Space.</p>`,
        "tip": "Инструменты вроде Cilium используют eBPF для полной замены kube-proxy, обеспечивая наблюдаемость L3-L7 с минимальным оверхедом."
      },
      {
        "q": "Head-based vs Tail-based Sampling в трейсинге: что выбрать?",
        "a": `<p>Сэмплинг нужен, чтобы не хранить терабайты трейсов.</p>
              <ul class="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Head-based:</strong> Решение "сохранять или нет" принимается <strong>в начале</strong> запроса (на первом сервисе).
                      <br><em>Минус:</em> Слепота к ошибкам. Если вы пишете 1% трафика, вы упустите редкую 500-ю ошибку, так как решение "не писать" было принято до её возникновения.</li>
                  <li><strong>Tail-based:</strong> Решение принимается <strong>в конце</strong>, когда весь трейс собран в буфере коллектора.
                      <br><em>Плюс:</em> Можно сохранить 100% ошибок и медленных запросов.
                      <br><em>Минус:</em> Дорого. Требует держать в памяти коллектора все данные до завершения трейса.</li>
              </ul>`,
        "tip": "Идеальный баланс: Head-based (для общей статистики) + Tail-based (для гарантированного сохранения аномалий)."
      }
    ]
  }
];

export const LEVELS: Record<string, LevelConfig> = {
  junior: {
    id: 'junior',
    title: 'Junior',
    subTitle: 'Базовые концепции',
    icon: '🌱',
    color: 'emerald-500',
    borderColor: 'border-emerald-500',
    bgHover: 'group-hover:bg-emerald-600',
    textHover: 'group-hover:text-emerald-600',
    description: 'Фундаментальные знания: примитивы Kubernetes, работа с kubectl, понимание разницы между императивным и декларативным подходами.',
    modules: JUNIOR_MODULES
  },
  middle: {
    id: 'middle',
    title: 'Middle',
    subTitle: 'Deep Dive & Internals',
    icon: '⚙️',
    color: 'blue-600',
    borderColor: 'border-blue-600',
    bgHover: 'group-hover:bg-blue-600',
    textHover: 'group-hover:text-blue-600',
    description: 'Тот самый "Deep Dive". Разбор того, как компоненты общаются друг с другом, как работает сеть (CNI, Ingress), хранение (CSI) и жизненный цикл приложений.',
    modules: MIDDLE_MODULES
  },
  senior: {
    id: 'senior',
    title: 'Senior',
    subTitle: 'Architect & Kernel',
    icon: '🧠',
    color: 'purple-600',
    borderColor: 'border-purple-600',
    bgHover: 'group-hover:bg-purple-600',
    textHover: 'group-hover:text-purple-600',
    description: 'Сложные архитектурные вопросы: Etcd RAFT, внутренности ядра Linux (Cgroups, Namespaces), безопасность, паттерны контроллеров (Informers) и масштабирование.',
    modules: SENIOR_MODULES
  }
};