
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
  }
];

const SENIOR_MODULES = [
  {
    id: 's1', title: '1. Внутренности Архитектуры', desc: 'Architect Level',
    questions: [
      {
        q: "Что такое Informer и Reflector в client-go и зачем они нужны?",
        a: `<p>Это ключевой паттерн оптимизации работы контроллеров.</p>
            <p>Если бы каждый контроллер постоянно опрашивал API (Polling), API сервер бы упал.</p>
            <ul>
                <li><strong>Reflector:</strong> Выполняет <code>List</code> и затем длинный <code>Watch</code> запрос к API серверу, получая поток изменений. Объекты кладутся в очередь <code>DeltaFIFO</code>.</li>
                <li><strong>Informer:</strong> Забирает объекты из очереди и обновляет <strong>локальный кэш</strong> (Store/Indexer).</li>
            </ul>
            <p>Логика контроллера (Reconcile loop) читает данные из локального кэша (мгновенно), а не из API. Это снижает нагрузку на порядки.</p>`,
        tip: "Упомяните 'SharedInformerFactory' — это механизм, позволяющий сотням контроллеров использовать один и тот же кэш и connection, экономя RAM."
      },
      {
        q: "Как работает Leader Election в Control Plane компонентах?",
        a: `<p>В HA кластере запущено 3 реплики Controller Manager и Scheduler, но работать должна <strong>только одна</strong> (чтобы не дублировать действия).</p>
            <p>Механизм:</p>
            <ol class="list-decimal pl-5 mt-2 space-y-1">
                <li>Используется объект <code>Lease</code> (или Endpoint) в неймспейсе <code>kube-system</code>.</li>
                <li>Все реплики пытаются обновить этот объект, записывая туда свое имя и timestamp.</li>
                <li>Кто успел записать — тот Лидер. Он обновляет timestamp каждые N секунд.</li>
                <li>Остальные (Standby) следят за Lease. Если timestamp не обновлялся долго — они пытаются захватить лидерство.</li>
            </ol>`,
        tip: "Это паттерн 'Optimistic Locking'. Важно: часы (clock) на нодах должны быть синхронизированы, иначе возможны проблемы с захватом лидерства."
      },
      {
        q: "Как работает API Priority and Fairness (APF)?",
        a: `<p>Это механизм защиты Control Plane от перегрузки (DDoS от собственных сломанных контроллеров).</p>
            <p>Запросы классифицируются по <code>FlowSchema</code> (кто пришел? системный юзер, лидер, обычный под?) и направляются в <code>PriorityLevelConfiguration</code>.</p>
            <p>У каждого уровня приоритета есть очереди. Если очередь переполнена, запросы отклоняются с 429 Too Many Requests. Это предотвращает ситуацию, когда один сломанный оператор "забивает" API сервер и не дает Kubelet'ам обновлять статусы нод.</p>`,
        tip: "Если вы видите 429 ошибки в логах контроллеров, не спешите добавлять CPU API серверу. Сначала проверьте метрики APF и возможно увеличьте очереди для нужной FlowSchema."
      }
    ]
  },
  {
    id: 's2', title: '2. Ядро Linux и Ресурсы', desc: 'Cgroups, OOM',
    questions: [
      {
        q: "Как CPU Requests и Limits реализованы в ядре Linux?",
        a: `<p>Kubernetes транслирует спецификацию пода в настройки <strong>Cgroups</strong>.</p>
            <ul class="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Requests -> cpu.shares:</strong> Это "мягкий" вес. Работает <em>только</em> при конкуренции за процессор. Если нода свободна, под с малым реквестом может занять хоть 100% CPU.</li>
                <li><strong>Limits -> cpu.cfs_quota_us:</strong> Это "жесткий" лимит времени планировщика (CFS). Если процесс исчерпал свою квоту (например, 100мс процессорного времени), ядро <strong>принудительно убирает</strong> его с CPU (Throttling) до следующего периода. Это вызывает задержки (latency), даже если CPU на ноде простаивает.</li>
            </ul>`,
        tip: "Для latency-sensitive приложений (базы данных, Java) часто рекомендуют не ставить CPU Limits, чтобы избежать троттлинга."
      },
      {
        q: "Как OOM Killer выбирает жертву? (OOM Score)",
        a: `<p>Когда память кончается, ядро Linux убивает процессы. Выбор жертвы зависит от <code>oom_score</code>.</p>
            <p>Kubelet манипулирует этим счетом через <code>oom_score_adj</code> в зависимости от QoS класса пода:</p>
            <ul>
                <li><strong>Guaranteed (Req == Lim):</strong> -998. (Почти бессмертны, убиваются последними).</li>
                <li><strong>BestEffort (No limits):</strong> +1000. (Первые кандидаты на вылет).</li>
                <li><strong>Burstable:</strong> Значение рассчитывается динамически.</li>
            </ul>`,
        tip: "Не путайте Node OOM (когда ядро убивает процесс) и Eviction (когда Kubelet мягко изгоняет поды при нехватке ресурсов). Kubelet пытается сработать раньше ядра."
      },
      {
        q: "Что такое 'Static' CPU Manager Policy в Kubelet?",
        a: `<p>По умолчанию Kubelet использует CFS Quota, и потоки приложения прыгают по всем ядрам CPU (Context switching). Это снижает производительность для High Performance задач.</p>
            <p>Политика <strong>Static</strong> позволяет выделить поду (класса Guaranteed с целым числом CPU) <strong>эксклюзивные физические ядра</strong>. Kubelet меняет cpuset cgroup, изолируя ядра только для этого пода. Никто другой (даже системные процессы) не смогут их использовать.</p>`,
        tip: "Требует аккуратной настройки флага `--kubelet-reserved-cpus`, чтобы не отобрать все ядра у системы и Kubelet'а, иначе нода станет 'NotReady'."
      }
    ]
  },
  {
    id: 's3', title: '3. Безопасность и CNI Advanced', desc: 'Exec, CNI, Security',
    questions: [
      {
        q: "Как технически работает `kubectl exec`? Опиши поток.",
        a: `<p>Это не SSH. Это цепочка соединений с Upgrade протокола.</p>
            <div class="bg-slate-800 text-white p-4 rounded text-sm font-mono my-2 whitespace-pre-wrap">
Client (kubectl) -> API Server (HTTP POST /exec -> Upgrade: SPDY/HTTP2)
API Server (Proxy) -> Kubelet (на ноде)
Kubelet -> CRI (Container Runtime) (gRPC Exec)
CRI -> Container Namespace (Stream stdin/stdout)
            </div>
            <p>API Server выступает в роли прокси. Данные передаются через стримы WebSocket или SPDY. Поэтому стабильность exec зависит от доступности API сервера.</p>`,
        tip: "Если `kubectl exec` висит, проверьте связность между API Server и Kubelet (порт 10250) и что сеть внутри кластера жива."
      },
      {
        q: "Что такое CNI Chaining?",
        a: `<p>Спецификация CNI позволяет запускать несколько плагинов последовательно для одного сетевого интерфейса.</p>
            <p>Пример популярной цепочки:
            <br>1. <strong>Base CNI (Calico/AWS VPC):</strong> Создает интерфейс, назначает IP, настраивает роутинг.
            <br>2. <strong>Portmap:</strong> Настраивает iptables правила для реализации <code>hostPort</code>.
            <br>3. <strong>Istio CNI:</strong> Настраивает iptables внутри неймспейса пода для прозрачного перехвата трафика в Envoy sidecar.</p>`,
        tip: "Это частый паттерн в облаках. Например, AWS EKS CNI использует chaining для реализации Security Groups for Pods."
      },
      {
        q: "Проблема ndots:5 и DNS",
        a: `<p>По умолчанию в <code>/etc/resolv.conf</code> пода стоит <code>ndots:5</code>. Это заставляет резолвер считать любой домен с < 5 точками "неполным" и перебирать суффиксы (search domains: <code>svc.cluster.local</code>, <code>namespace...</code>).</p>
            <p><strong>Проблема:</strong> Если вы резолвите <code>google.com</code> (1 точка), K8s сначала попробует:
            1. <code>google.com.namespace.svc.cluster.local</code> (NXDOMAIN)
            2. <code>google.com.svc.cluster.local</code> (NXDOMAIN)
            ...и так далее.</p>
            <p>Это утраивает нагрузку на DNS сервер. Решение: использовать FQDN (с точкой в конце: <code>google.com.</code>) или менять <code>dnsConfig</code> в поде.</p>`,
        tip: "Если приложение медленно открывает внешние соединения, добавьте точку в конце хоста (`google.com.`) — это мгновенно уберет лишние DNS запросы."
      },
      {
        q: "Explain the concept and functionality of Pod Security Admission (PSA)",
        a: `<p><strong>Pod Security Admission (PSA)</strong> — это встроенный Admission Controller, который реализует стандарты <strong>Pod Security Standards (PSS)</strong>.</p>
            <p>Он пришел на замену <strong>PodSecurityPolicy (PSP)</strong>.</p>
            <h4 class="font-bold mt-2">Как работает PSA:</h4>
            <p>PSA управляется через <strong>Labels на Namespace</strong>. Никаких CRD.</p>
            <h4 class="font-bold mt-2">Уровни (Profiles):</h4>
            <ul class="list-disc pl-5 space-y-1">
                <li><strong>Privileged:</strong> Разрешено всё.</li>
                <li><strong>Baseline:</strong> Минимум ограничений.</li>
                <li><strong>Restricted:</strong> Максимальная защита (Best Practices).</li>
            </ul>`,
        tip: "PSA — это 'Batteries included' решение. Для сложной логики (например, разрешить image только из определенного registry) всё ещё нужен OPA Gatekeeper или Kyverno."
      },
      {
        q: "OIDC Authentication flow",
        a: `<p>API Server <strong>не хранит</strong> пользователей. Он доверяет токенам (JWT ID Token), подписанным внешним провайдером.</p>
            <ol class="list-decimal pl-5 mt-2 space-y-1">
                <li>Пользователь логинится в Keycloak/Google, получает <code>id_token</code>.</li>
                <li><code>kubectl</code> отправляет этот токен в заголовке <code>Authorization: Bearer ...</code>.</li>
                <li>API Server проверяет цифровую подпись токена.</li>
                <li>Если подпись верна, он извлекает <code>email</code>/<code>groups</code> и использует их для RBAC.</li>
            </ol>`,
        tip: "Важный нюанс: K8s не умеет 'отзывать' токены. Если вы уволили сотрудника, его токен будет работать до истечения срока действия (TTL), если не использовать короткоживущие токены (refresh flow)."
      },
      {
        q: "CSR API и Kubelet Bootstrapping",
        a: `<p>Когда новая нода добавляется в кластер, у неё нет сертификатов. Она не может просто сгенерировать их сама.</p>
            <p>Kubelet использует начальный токен (bootstrap token), чтобы отправить запрос <strong>CSR</strong> в API Server.</p>
            <p>Контроллер <code>csrapproving</code> проверяет токен и автоматически одобряет (Approve) запрос, выдавая Kubelet'у полноценный клиентский сертификат.</p>`,
        tip: "Никогда не включайте автоматическое утверждение (auto-approval) для всех CSR подряд в продакшене. Это позволяет любой машине в сети притвориться нодой кластера."
      },
      {
        q: "Компоненты CSI драйвера",
        a: `<p>CSI драйвер обычно состоит из пода на каждой ноде (Node Driver) и центрального контроллера (Controller Driver).</p>
            <p>K8s предоставляет готовые <strong>Sidecar контейнеры</strong>:</p>
            <ul class="list-disc pl-5 mt-2 space-y-1">
                <li><strong>external-provisioner:</strong> Следит за PVC, вызывает <code>CreateVolume</code>.</li>
                <li><strong>external-attacher:</strong> Следит за VolumeAttachment, вызывает <code>ControllerPublishVolume</code>.</li>
                <li><strong>node-driver-registrar:</strong> Регистрирует драйвер в Kubelet.</li>
            </ul>`,
        tip: "Важно понимать, что операции Provisioning/Attaching делает центральный контроллер, а Mounting/Formatting — демон на ноде."
      },
      {
        q: "Volume Expansion Flow",
        a: `<p>Процесс двухэтапный:</p>
            <ol class="list-decimal pl-5 mt-2 space-y-1">
                <li><strong>Control Plane Expansion:</strong> <code>external-resizer</code> вызывает API облака, чтобы увеличить размер диска.</li>
                <li><strong>File System Expansion:</strong> Kubelet на ноде обнаруживает изменение и вызывает <code>NodeExpandVolume</code> (resize2fs/xfs_growfs).</li>
            </ol>`,
        tip: "Помните, что уменьшить диск (Shrink) в Kubernetes нельзя. Также для расширения файловой системы под часто должен быть запущен (для онлайн ресайза)."
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
