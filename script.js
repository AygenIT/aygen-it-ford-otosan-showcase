const slides=[...document.querySelectorAll(".slide")];
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const prevBtn=$("#prevBtn"),nextBtn=$("#nextBtn"),progressBar=$("#progressBar"),currentNo=$("#currentNo"),totalNo=$("#totalNo"),sectionName=$("#sectionName");
const transitionStage=$("#transitionStage"),transitionNumber=$("#transitionNumber"),transitionName=$("#transitionName");
const overview=$("#overview"),overviewGrid=$("#overviewGrid"),infoModal=$("#infoModal"),notesPanel=$("#speakerNotes"),notesBtn=$("#notesBtn"),notesClose=$("#notesClose"),notesTitle=$("#speakerNotesTitle"),notesText=$("#speakerNotesText");
let current=0,lang="tr",busy=false,touchStartX=null;
totalNo.textContent=String(slides.length).padStart(2,"0");

// Decode cinematic backgrounds while the opening slide is being viewed so later
// chapter changes never pay the image-decode cost inside the transition frame.
const cinematicAssetSources=[
  "assets/cinematic-backbone-v15.jpg",
  "assets/cinematic-integration-v15.jpg",
  "assets/cinematic-rpa-v15.jpg",
  "assets/supalan/supalan-1.jpg"
];
const cinematicAssetsReady=Promise.all(cinematicAssetSources.map(src=>{
  const image=new Image();
  image.decoding="async";
  image.src=src;
  return typeof image.decode==="function"?image.decode().catch(()=>undefined):Promise.resolve();
}));

const partnershipData={
tr:{
collaboration:["01 / YAKIN ÇALIŞMA","Ford ekipleriyle ortak çalışma masası","İhtiyaçlar Ford operasyon ekipleriyle doğrudan ele alınır; hedef, kapsam ve öncelikler birlikte netleştirilir."],
analysis:["02 / ANALİZ","İhtiyacı veriye ve akışa dönüştürme","Mevcut süreç, veri kaynakları, iş kuralları ve istisnalar birlikte analiz edilir; ölçülebilir kabul kriterleri oluşturulur."],
development:["03 / GELİŞTİRME","Onaylı kapsamı çalışan çözüme dönüştürme","Çözüm, Ford süreçlerine uyumlu modüler bileşenlerle geliştirilir; entegrasyonlar ve kritik senaryolar uçtan uca doğrulanır."],
architecture:["04 / GÜVENLİ MİMARİ","Güvenli ve sürdürülebilir temel","Yetkilendirme, veri bütünlüğü, izlenebilir kayıt ve genişleyebilir entegrasyon yapısı Ford’un güvenlik gereksinimleriyle birlikte ele alınır."],
iteration:["05 / HIZLI İTERASYON","Geri bildirimle kısa geliştirme döngüsü","Demo ve kullanıcı testlerinden gelen geri bildirimler hızla değerlendirilir; küçük, kontrollü sürümlerle çözüm sürekli iyileştirilir."],
delivery:["06 / TESLİMAT","Kontrollü geçiş, kalıcı kullanım","Kabul testleri tamamlanan çözüm dokümantasyon, kullanıcı bilgilendirmesi ve destek planıyla devreye alınır; sonuçlar birlikte izlenir."]},
en:{
collaboration:["01 / CLOSE COLLABORATION","A shared working table with Ford teams","Needs are addressed directly with Ford operations teams, while goals, scope and priorities are clarified together."],
analysis:["02 / ANALYSIS","Turning needs into data and process flows","The current process, data sources, business rules and exceptions are analysed together to define measurable acceptance criteria."],
development:["03 / DEVELOPMENT","Turning approved scope into a working solution","The solution is developed with modular components aligned to Ford processes, while integrations and critical scenarios are validated end to end."],
architecture:["04 / SECURE ARCHITECTURE","A secure and sustainable foundation","Authorisation, data integrity, traceable records and an extensible integration structure are addressed together with Ford’s security requirements."],
iteration:["05 / FAST ITERATION","Short development cycles shaped by feedback","Feedback from demos and user tests is evaluated quickly, continuously improving the solution through small, controlled releases."],
delivery:["06 / DELIVERY","Controlled rollout, lasting adoption","After acceptance testing, the solution goes live with documentation, user guidance and a support plan, and outcomes are monitored together."]}};
const partnershipKeys=["collaboration","analysis","development","architecture","iteration","delivery"];

const projectData={
tr:{
customs:["CUSTOMS & TRACKING","Gümrük ve Takip Projeleri","Ford operasyonlarında beyan, evrak, süre ve geçici rejim risklerini tek platformda kontrol altına alan yönetim katmanı.",["Beyanname Tescil Kontrolü","Yedek Parça Dekont ve Beyanname Görüntüsü","Bankaya Gönderilen Beyanname Görüntüsü","Ford'a Özel Aycube BI'lar","Kapı Bildirimleri<br>•Yedek parça dosyaları için Ford nakliye ve malzeme kabule bilgi gönderir."],"flow"],
integration:["INTEGRATION & DATA","Entegrasyon ve Veri Projeleri","Kaynak sistem verisini Ford operasyon kurallarıyla birleştirip manuel girişleri azaltan, veri kalitesini yükselten entegrasyon omurgası.",["Ford Vergi","Ford İthalat","Ford Araç","Ford Araç İhracat","Ford İntaç Entegrasyon","Ford Kamyon İhracat","Ford Parça İhracat","Ford Arşiv Entegrasyon","GetApp Entegrasyon","TPS Entegrasyon"],"flow"],
automation:["RPA & OCR","RPA ve OCR Projeleri","Tekrarlı portal ve belge işlerini robotlaştırarak operasyon ekiplerine hız, standart ve hata kontrolü kazandıran otomasyon katmanı.",["Tareks","tareks işlemlerinin rpa üzerinde yapılması","Ford Fatura OCR","Ford Faturalarında 0910 Tekrarlanmasının Önlenmesi","Otomatik Fatura Ekranına Ford Firmalarının Dosyalarının Gelmesi"],"flow"],
finance:["FINANCE & COMMISSION","Finans ve Komisyon Projeleri","Vergi, para, dekont, ekstre ve komisyon akışlarında finansal görünürlük ve denetlenebilir kontrol sağlayan çözüm paketi.",[],"flow"],
archive:["ARCHIVE & DOCUMENT","Arşiv ve Doküman Projeleri","Ford evrak hafızasını standartlaştıran, arama süresini kısaltan ve denetim gücünü artıran doküman omurgası.",["Arşiv Fihrist","Aycube İthalat Raporu","Aycube İhracat Raporu","Toplu Evrak Talep"],"search"]},
en:{
customs:["CUSTOMS & TRACKING","Customs and Tracking Projects","An executive control layer for declaration, document, deadline and temporary-regime risks across Ford operations.",["Temporary import","Bulk Documents","Summary Declaration Tracking","Temporary Import / Export Tracking","Summary-declaration deadline warning","GetApp"],"flow"],
integration:["INTEGRATION & DATA","Integration and Data Projects","An integration backbone that combines source-system data with Ford-specific rules, reducing manual entry and improving data quality.",["Ford Integration","Bulk INTAÇ Query with date integration","Bulk INTAÇ date query","GTIP Update","Automatically populated export fields","Automatic post-registration tax-field entry","Accounting Office Information"],"flow"],
automation:["RPA & OCR","RPA and OCR Projects","An automation layer that robotizes repetitive portal and document tasks, giving teams speed, standards and error control.",["TAREKS","TAREKS operations through RPA","Ford Invoice OCR","Prevention of repeated 0910 on Ford invoices","Automatic arrival of Ford company files on the invoice screen"],"flow"],
finance:["FINANCE & COMMISSION","Finance and Commission Projects","A solution suite that provides financial visibility and auditable control across tax, cash, receipt, statement and commission flows.",[],"flow"],
archive:["ARCHIVE & DOCUMENT","Archive and Document Projects","A document backbone that standardizes Ford’s document memory, reduces search time and strengthens audit readiness.",["Archive Index","Aycube Import Report","Aycube Export Report","Bulk Document Request"],"search"]}};

const projectItems={
customs:[
  {title:{tr:"Beyanname Tescil Kontrolü",en:"Declaration Registration Check"},description:{tr:"Beyanname tescilinden önce zorunlu alanları ve Ford operasyon kurallarını kontrol eder; eksik veya tutarsız kayıtları işlem tamamlanmadan görünür kılar.",en:"Checks mandatory fields and Ford operational rules before declaration registration, exposing missing or inconsistent records before the transaction is completed."}},
  {title:{tr:"Yedek Parça Dekont ve Beyanname Görüntüsü",en:"Spare-Part Receipt and Declaration Image"},description:{tr:"Yedek parça dosyalarındaki dekontları beyanname görüntüleriyle eşleştirir; belgeye tek noktadan ve izlenebilir biçimde erişim sağlar.",en:"Matches receipts in spare-part files with declaration images, providing traceable access to the document from a single point."}},
  {title:{tr:"Bankaya Gönderilen Beyanname Görüntüsü",en:"Declaration Image Sent to the Bank"},description:{tr:"Tescilli beyanname görüntüsünü kontrollü şekilde alır, yetkili banka akışına iletir ve gönderim sonucunu kayıt altına alır.",en:"Retrieves the registered declaration image in a controlled flow, sends it to the authorised bank channel and records the delivery result."}},
  {title:{tr:"Ford’a Özel Aycube BI’lar",en:"Ford-Specific Aycube BI Dashboards"},description:{tr:"İthalat, ihracat ve gümrük operasyonlarını Ford’a özel KPI, durum ve istisna ekranlarında bir araya getirir.",en:"Brings import, export and customs operations together in Ford-specific KPI, status and exception dashboards."}},
  {title:{tr:"Kapı Bildirimleri",en:"Gate Notifications"},description:{tr:"Yedek parça dosyaları için Ford nakliye ve malzeme kabul ekiplerine zamanında bilgi gönderir; kapı ve teslim hareketlerini izlenebilir hâle getirir.",en:"Sends timely information to Ford transport and material-acceptance teams for spare-part files, making gate and delivery movements traceable."}}
],
integration:[
  {title:{tr:"Ford Vergi",en:"Ford Tax"},description:{tr:"Vergi alanlarını ve hesaplama sonuçlarını Ford iş kurallarıyla doğrulayarak ilgili sistemlere standart biçimde aktarır ve gerekli ödeme işlemlerini gerçekleştirir.",en:"Validates tax fields and calculation results against Ford business rules and transfers them to the relevant systems in a standard format."}},
  {title:{tr:"Ford İthalat",en:"Ford Import"},description:{tr:"Gölcük, Eskişehir ve yedek parça beyannameleri çift yönlü entegre edilir.",en:"Synchronises import-file, declaration and line-item data between source systems, Aycube and Ford processes."}},
  {title:{tr:"Ford Araç",en:"Ford Vehicle"},description:{tr:"Araç bazlı temel veriyi operasyon kayıtlarıyla ilişkilendirir; aynı araç için tutarlı ve güncel veri akışı sağlar.",en:"Links vehicle master data with operational records, maintaining a consistent and current data flow for each vehicle."}},
  {title:{tr:"Ford Araç İhracat",en:"Ford Vehicle Export"},description:{tr:"Araç ihracatı verilerini sevkiyat ve beyanname adımlarıyla birleştirir; manuel tekrarları ve veri ayrışmalarını azaltır.",en:"Combines vehicle-export data with shipment and declaration steps, reducing repeated manual work and data discrepancies."}},
  {title:{tr:"Ford İntaç Entegrasyon",en:"Ford Closure Integration"},description:{tr:"İntaç tarihini ve sonuç bilgisini ilgili kayıtlara otomatik taşır; toplu sorgu ve manuel güncelleme ihtiyacını azaltır.",en:"Automatically carries closure dates and results into the related records, reducing bulk-query and manual-update work."}},
  {title:{tr:"Ford Kamyon İhracat",en:"Ford Truck Export"},description:{tr:"Kamyon ihracatına özel araç, sevkiyat ve beyan verilerini uçtan uca entegre eder; süreç durumunu ortak bir görünümde tutar.",en:"Integrates vehicle, shipment and declaration data specific to truck exports, keeping process status in one shared view."}},
  {title:{tr:"Ford Parça İhracat",en:"Ford Parts Export"},description:{tr:"Parça ihracatı kalemlerini, miktarlarını ve beyan alanlarını ilgili Ford akışlarına standart biçimde aktarır.",en:"Transfers parts-export line items, quantities and declaration fields into the relevant Ford flows in a standard format."}},
  {title:{tr:"Ford Arşiv Entegrasyon",en:"Ford Archive Integration"},description:{tr:"Ford beyanname işlem ve belgeleri standart metaveriyle Ford arşivine iletir; kayıtların doğru konumda saklanmasını sağlar.",en:"Delivers completed transactions and documents to the Ford archive with standard metadata, ensuring that records are stored in the correct location."}},
  {title:{tr:"GetApp Entegrasyon",en:"GetApp Integration"},description:{tr:"GetApp üzerinden gelen beyanname verileri Aycube süreçlerine aktarır; çift veri girişini ve işlem gecikmesini azaltır.",en:"Transfers operational data received through GetApp into Aycube processes, reducing duplicate entry and processing delays."}},
  {title:{tr:"TPS Entegrasyon",en:"TPS Integration"},description:{tr:"TPS sistemi ile Geçici ithalat ve IMEI başvuruları entegre edilir.",en:"Maps required operational fields with TPS through secure data exchange and keeps process information current."}}
],
automation:[
  {title:{tr:"TAREKS",en:"TAREKS"},description:{tr:"TAREKS kapsamındaki başvuru, durum ve sonuç bilgilerini tek takip akışında görünür kılar.",en:"Makes application, status and result information within the TAREKS scope visible in one tracking flow."}},
  {title:{tr:"TAREKS İşlemlerinin RPA Üzerinde Yapılması",en:"TAREKS Operations Through RPA"},description:{tr:"Tekrarlı portal girişlerini ve sorguları robotla yürütür; ekipleri manuel adımlardan kurtarıp istisnalara odaklar.",en:"Runs repetitive portal entries and queries through a robot, freeing teams from manual steps so they can focus on exceptions."}},
  {title:{tr:"Ford Fatura OCR",en:"Ford Invoice OCR"},description:{tr:"Ford faturalarındaki kritik alanları OCR ile okuyup yapılandırılmış veriye dönüştürür; veri girişini hızlandırır ve hatayı azaltır.",en:"Reads critical fields on Ford invoices with OCR and converts them into structured data, accelerating entry and reducing errors."}},
  {title:{tr:"Ford Faturalarında 0910 Tekrarlanmasının Önlenmesi",en:"Prevention of Repeated 0910 on Ford Invoices"},description:{tr:"0910 kodunu belge ve kayıt bazında kontrol eder; mükerrer işaretleme riskini işlem öncesinde durdurur.",en:"Checks the 0910 code by document and record, stopping duplicate marking risk before processing."}},
  {title:{tr:"Ford Dosyalarının Otomatik Fatura Ekranına Gelmesi",en:"Ford Files Arriving on the Automatic Invoice Screen"},description:{tr:"Ford firmalarına ait dosyaları kurallara göre otomatik fatura ekranına yönlendirir; doğru dosyanın doğru işlem kuyruğuna düşmesini sağlar.",en:"Routes files belonging to Ford companies to the automatic invoice screen according to defined rules, placing each file in the correct processing queue."}}
],
finance:[],
archive:[
  {title:{tr:"Arşiv Fihrist",en:"Archive Index"},description:{tr:"Beyanname arşivindeki kaydın Ford arşivinde bulunduğu konumu gösterir; finansal belgeye hızlı ve denetlenebilir erişim sağlar.",en:"Shows where a declaration-archive record is held in the Ford archive, enabling fast and auditable access to financial documents."}},
  {title:{tr:"Aycube İthalat Raporu",en:"Aycube Import Report"},description:{tr:"İthalat işlemlerini vergi, kıymet, dosya ve beyanname boyutlarıyla tek raporda birleştirir.",en:"Combines import transactions in one report across tax, value, file and declaration dimensions."}},
  {title:{tr:"Aycube İhracat Raporu",en:"Aycube Export Report"},description:{tr:"İhracat süreçlerini sevkiyat, beyanname ve sonuç bilgileriyle izlenebilir bir yönetim görünümüne taşır.",en:"Turns export processes into a traceable management view with shipment, declaration and result information."}},
  {title:{tr:"Toplu Evrak Talep",en:"Bulk Document Request"},description:{tr:"Birden fazla dosya için evrak taleplerini tek işlemde Beyanname No. ya da Dosya No. ile Aycube üzerinden oluşturur, durumlarını izler ve tamamlanan belgeleri ilgili kayda bağlar.",en:"Creates document requests for multiple files in one operation, tracks their status and links completed documents to the relevant record."}}
]};

const projectScreens={
  customs:[
    {src:"assets/aycube_screens/gecici-ithalat-takip.png",label:{tr:"Geçici İthalat Takip",en:"Temporary Import Tracking"}},
    {src:"assets/aycube_screens/ithalat-beyanname-raporu-detayli.png",label:{tr:"İthalat Beyanname Raporu Detaylı",en:"Detailed Import Declaration Report"}},
    {src:"assets/aycube_screens/ithalat-beyanname-raporu.png",label:{tr:"İthalat Beyanname Raporu",en:"Import Declaration Report"}},
    {src:"assets/aycube_screens/ihracat-beyanname-raporu.png",label:{tr:"İhracat Beyanname Raporu",en:"Export Declaration Report"}}
  ],
  integration:[
    {src:"assets/aycube_screens/ithalat-beyanname-raporu.png",label:{tr:"İthalat Beyanname Raporu",en:"Import Declaration Report"}},
    {src:"assets/aycube_screens/ihracat-beyanname-raporu.png",label:{tr:"İhracat Beyanname Raporu",en:"Export Declaration Report"}},
    {src:"assets/aycube_screens/bi-gtip-analiz.png",label:{tr:"GTİP Analiz Ekranı",en:"GTIP Analysis Screen"}},
    {src:"assets/aycube_screens/bi-ihracat-ithalat-grafik.png",label:{tr:"İhracat / İthalat Grafik Ekranı",en:"Export / Import Dashboard"}}
  ],
  automation:[
    {src:"assets/aycube_screens/arsiv-dosya-yukleme.png",label:{tr:"Arşiv Dosya Yükleme",en:"Archive File Upload"}},
    {src:"assets/aycube_screens/aycube-ana-ekran.png",label:{tr:"Aycube Ana Ekran",en:"Aycube Home Screen"}},
    {src:"assets/aycube_screens/gecici-ithalat-takip.png",label:{tr:"Takip Akışı",en:"Tracking Flow"}}
  ],
  finance:[
    {src:"assets/aycube_screens/all-bi.png",label:{tr:"All BI",en:"All BI"}},
    {src:"assets/aycube_screens/bi-ihracat-ithalat-grafik.png",label:{tr:"İhracat / İthalat Grafik",en:"Export / Import Dashboard"}},
    {src:"assets/aycube_screens/bi-gtip-analiz.png",label:{tr:"GTİP ve İstatistiki Kıymet",en:"GTIP and Statistical Value"}},
    {src:"assets/aycube_screens/aycube-ana-ekran.png",label:{tr:"Aycube Haber ve KPI Alanı",en:"Aycube News and KPI Area"}}
  ],
  archive:[
    {src:"assets/aycube_screens/arsiv-fihrist.png",label:{tr:"Arşiv Fihrist",en:"Archive Index"}},
    {src:"assets/aycube_screens/arsiv-dosya-yukleme.png",label:{tr:"Arşiv Dosya Yükleme",en:"Archive File Upload"}},
    {src:"assets/aycube_screens/bi-gtip-analiz.png",label:{tr:"Ford GTİP Raporu",en:"Ford GTIP Report"}}
  ],
  intac:[
    {src:"assets/aycube_screens/ithalat-beyanname-raporu-detayli.png",label:{tr:"Detaylı Sorgu Sonuçları",en:"Detailed Query Results"}},
    {src:"assets/aycube_screens/ithalat-beyanname-raporu.png",label:{tr:"Toplu İthalat Görünümü",en:"Bulk Import View"}}
  ]
};

const projectScreenDetails={
  "assets/aycube_screens/gecici-ithalat-takip.png":{
    tr:"Geçici ithalat ve ihracat dosyalarının giriş, kapanış ve süre bilgilerini tek ekranda izler. Yaklaşan terminleri, açık kalan kayıtları ve aksiyon bekleyen işlemleri Ford ekipleri için görünür hâle getirir.",
    en:"Tracks entry, closure and deadline information for temporary import and export files on one screen. It makes approaching deadlines, open records and actions awaiting attention visible to Ford teams."
  },
  "assets/aycube_screens/ithalat-beyanname-raporu-detayli.png":{
    tr:"İthalat beyannamesini kalem, GTİP, vergi, kıymet ve belge referanslarıyla ayrıntılı gösterir. Operasyon ekiplerinin tek kayıttan geriye doğru kontrol ve karşılaştırma yapmasını kolaylaştırır.",
    en:"Displays an import declaration in detail across line items, GTIP, tax, value and document references. It makes retrospective control and comparison easier from a single record."
  },
  "assets/aycube_screens/ithalat-beyanname-raporu.png":{
    tr:"Ford ithalat işlemlerini tarih, dosya, beyanname ve durum bazında ortak bir raporda toplar. Filtrelenebilir görünüm sayesinde geciken, eksik veya kontrol bekleyen kayıtlar hızla bulunur.",
    en:"Combines Ford import transactions in one report by date, file, declaration and status. Its filterable view helps teams quickly find delayed, incomplete or pending records."
  },
  "assets/aycube_screens/ihracat-beyanname-raporu.png":{
    tr:"İhracat beyannamelerini sevkiyat, tescil ve intaç sonuçlarıyla birlikte izler. Dosyanın hangi aşamada olduğunu ve kapanış için gereken aksiyonları tek bakışta gösterir.",
    en:"Tracks export declarations together with shipment, registration and closure results. It shows the current stage of each file and the actions required for closure at a glance."
  },
  "assets/aycube_screens/bi-gtip-analiz.png":{
    tr:"GTİP kullanımını dönem, ürün ve dosya bazında analiz eder; istatistiki kıymet ve sınıflandırma sapmalarını karşılaştırmalı olarak görünür kılar.",
    en:"Analyses GTIP usage by period, product and file, making statistical-value and classification variances visible through comparisons."
  },
  "assets/aycube_screens/bi-ihracat-ithalat-grafik.png":{
    tr:"İthalat ve ihracat hacimlerini dönemsel grafiklerle karşılaştırır. İşlem trendlerini, yoğunluk değişimlerini ve dikkat gerektiren sapmaları yönetim görünümüne taşır.",
    en:"Compares import and export volumes through period-based charts, bringing transaction trends, workload changes and notable variances into a management view."
  },
  "assets/aycube_screens/arsiv-dosya-yukleme.png":{
    tr:"Belgeleri doğru dosya ve işlem kaydıyla ilişkilendirerek standart isim ve referans bilgileriyle arşive yükler. Eksik veya hatalı yüklemelerin önüne geçilmesine yardımcı olur.",
    en:"Uploads documents to the archive with standard names and references while linking them to the correct file and transaction record, helping prevent missing or incorrect uploads."
  },
  "assets/aycube_screens/aycube-ana-ekran.png":{
    tr:"Aycube ana ekranı, Ford operasyonlarına ait görevleri, bildirimleri ve temel göstergeleri tek giriş noktasında birleştirir; kullanıcıyı öncelikli aksiyona yönlendirir.",
    en:"The Aycube home screen combines Ford operational tasks, notifications and key indicators in one entry point, directing users to priority actions."
  },
  "assets/aycube_screens/all-bi.png":{
    tr:"Operasyon ve raporlama göstergelerini tek BI merkezinde toplar. Ford ekipleri ithalat, ihracat, finans ve performans verilerine aynı görünüm üzerinden ulaşabilir.",
    en:"Brings operational and reporting indicators together in one BI centre, giving Ford teams a shared view of import, export, finance and performance data."
  },
  "assets/aycube_screens/arsiv-fihrist.png":{
    tr:"Beyanname ve ek belgelerin Ford arşivindeki konumunu indeksler. Dosya numarası, beyanname veya referans üzerinden hızlı ve denetlenebilir belge erişimi sağlar.",
    en:"Indexes the location of declarations and supporting documents in the Ford archive, enabling fast and auditable access by file number, declaration or reference."
  }
};

const integrationData={
tr:{
import:{title:"İthalat Entegrasyonu",description:"Ford Entegrasyon kapsamında araç ve yedek parça ithalatı; farklı veri alanları, saymanlık bilgisi, GTİP kuralları, bütçeler ve geliştirme süreçleri nedeniyle ayrı akışlarda yönetilir.",rate:96.4,rateText:"%96,4",cards:[["01 / VEHICLE","İthalat Araç","Araç operasyonuna özel veri modeli, doğrulama alanları, saymanlık bilgisi ve beyanname senaryoları."],["02 / SPARE PARTS","İthalat Yedek Parça","Yedek parça kalemleri, GTİP güncelleme, alan seçimi ve kontrol ihtiyaçları."]]},
export:{code:"EXPORT INTEGRATION",title:"İhracat Entegrasyonu",description:"Araç, kamyon ve yedek parça ihracatı; otomatik getirilen alanlar, vergi bilgisinin tescil sonrası aktarımı, sevkiyat ve beyanname ihtiyaçları nedeniyle operasyona özel akışlarla yönetilir.",rate:94.8,rateText:"%94,8",cards:[["01 / VEHICLE","İhracat Araç","Araç ihracatına özel sevkiyat, beyanname ve otomatik alan akışı."],["02 / SPARE PARTS","İhracat Yedek Parça","Kalem bazlı veri, vergi alanı ve doğrulama ihtiyaçlarına özel akış."],["03 / TRUCK","İhracat Kamyon","Kamyon ihracatına ait araç, sevkiyat ve beyanname verileri tek akışta eşleştirilir. Zorunlu alanlar doğrulanır; tescil, çıkış ve intaç durumu Ford ekipleri için izlenebilir hâle gelir."]]},
archive:{code:"ARCHIVE INTEGRATION",title:"Arşiv Entegrasyonu",description:"Ford Arşiv Entegrasyon ve Arşiv Fihrist ile evrakları tek havuzda, standart metaveri ve olay bazlı arşivleme yaklaşımıyla yönetir.",rate:100,rateText:"%100",cards:[["01 / INDEX","Hızlı Erişim","Anahtar alanlarla saniyeler içinde arama, görüntüleme ve kayıt ilişkilendirme."],["02 / AUDIT","Versiyon & Audit Trail","Tek doğru kayıt, versiyon geçmişi ve denetlenebilir işlem izi."]]},
bank:{code:"BANK INTEGRATION",title:"Banka Entegrasyonu",description:"Bankaya gönderilen beyanname görüntüsü, dekont edilmeyen dosyaların tespiti ve ekstre gönderimi süreçlerini standart, kontrollü ve izlenebilir hâle getirir.",rate:99.2,rateText:"%99,2",cards:[["01 / TRANSFER","Kontrollü İletim","Bankaya gönderilen beyanname görüntüsünün kontrollü alınması ve iletilmesi."],["02 / CONTROL","Mutabakat & İstisna","Dekont edilmeyen dosyaların tespiti, otomatik ekstre ve hata durumlarının izlenmesi."]]}},
en:{
import:{title:"Import Integration",description:"Vehicle and spare-part operations are managed as separate flows because of different data fields, validation rules, budgets and delivery cycles.",rate:96.4,rateText:"96.4%",cards:[["01 / VEHICLE","Vehicle Import","Vehicle-specific data model, validation fields and declaration scenarios."],["02 / SPARE PARTS","Spare-Part Import","Line-item, field and validation needs specific to spare-part operations."]]},
export:{code:"EXPORT INTEGRATION",title:"Export Integration",description:"Vehicle, truck and spare-part exports are managed through operation-specific flows because shipment, declaration, document and data-standardisation needs differ.",rate:94.8,rateText:"94.8%",cards:[["01 / VEHICLE","Vehicle Export","Vehicle-specific shipment, declaration and validation flow."],["02 / SPARE PARTS","Spare-Part Export","A flow tailored to line-level data, documents and validation needs."],["03 / TRUCK","Truck Export","Vehicle, shipment and declaration data for truck exports is matched in one flow. Mandatory fields are validated, making registration, exit and closure status traceable for Ford teams."]]},
archive:{code:"ARCHIVE INTEGRATION",title:"Archive Integration",description:"Manages documents in one pool with standard metadata and event-based archiving.",rate:100,rateText:"100%",cards:[["01 / INDEX","Fast Access","Search and view within seconds using key fields."],["02 / AUDIT","Version & Audit Trail","Single source of truth, version history and auditable records."]]},
bank:{code:"BANK INTEGRATION",title:"Bank Integration",description:"Makes payments, collections, receipts and declaration-image flows standard, controlled and traceable.",rate:99.2,rateText:"99.2%",cards:[["01 / TRANSFER","Controlled Delivery","Automatic recorded delivery of declaration images to the bank."],["02 / CONTROL","Reconciliation & Exception","Monitoring successful, pending and failed states."]]}}};

const projectCatalog={
tr:[["Gümrük & Takip",["Geçici ithalat","Toplu Evrak","Özet Beyan Takip","GetApp","Geçici İthalat / İhracat Takibi","Özet beyan süresi yaklaştığında uyarı gelmesi"]],["Entegrasyon & Veri",["Toplu İntaç Sorgulama (intaç tarihi entegrasyonla gitmesi)","intaç tarihi toplu sorgulama","Gtip Güncelleme","İhracatta Oto. Getirilen bazı alanlar","Ford Entegrasyon","Saymanlık Bilgisi","İhracat Sisteminde vergi alanı dolu ise tescil sonrası bilgi girişine oto. gelmesi"]],["RPA & OCR",["Tareks","tareks işlemlerinin rpa üzerinde yapılması","Ford Fatura OCR","Ford Faturalarında 0910 Tekrarlanmasının Önlenmesi","Otomatik Fatura Ekranına Ford Firmalarının Dosyalarının Gelmesi"]],["Finans & Komisyon",["Bankaya gönderilen Byn. Görüntüsü","Müşteri komisyonları","Dekont Edilmeyen Dosyaların tespiti","Ekstre gönderimi otomatize edilmesi","Vergi Talep","Para Talep","komisyon hesaplama","öz-3 işaretlemerinde komisyon işaretlemeleri kontrolü"]],["Arşiv & Rapor",["Ford Gtip Raporu","Ford Arşiv Entegrasyon","Arşiv Fihrist"]]],
en:[["Customs & Tracking",["Temporary import","Bulk Documents","Summary Declaration Tracking","GetApp","Temporary Import / Export Tracking","Summary-declaration deadline warning"]],["Integration & Data",["Bulk INTAÇ Query with date integration","Bulk INTAÇ date query","GTIP Update","Automatically populated export fields","Ford Integration","Accounting Office Information","Automatic post-registration tax-field entry"]],["RPA & OCR",["TAREKS","TAREKS operations through RPA","Ford Invoice OCR","Prevention of repeated 0910 on Ford invoices","Automatic arrival of Ford company files on invoice screen"]],["Finance & Commission",["Declaration image sent to bank","Customer commissions","Detection of files without receipts","Automated statement delivery","Tax Request","Cash Request","Commission calculation","Commission-marking control for ÖZ-3"]],["Archive & Reporting",["Ford GTIP Report","Ford Archive Integration","Archive Index"]]]};
const reportCatalog={
tr:[["İthalat & Beyanname",["Ford Eksik evrak raporu haftalık","ford eksik evrak raporu","Detaylı ithalat raporları","Ford beyanname raporu","ford serbest dolaşıma giriş listesi YP","ford ithalat raporu","ford ithalat","ford istatistiki kıymet","ford ötv mail","ford navlun mail","ford imei mail","ikileme"]],["İhracat",["ford ihracat gtip bazlı rapor","ford ihracat raporu (0100)","Ford İhracat Raporu 0100-cargo","Ford İhracat","Ford parça ihracat raporu","Ford geçici ihracat","Ford intaç mail","Ford Günlük Araç İhracat","Ford ihracat ceza","ford sandık","ford vw ihracat","ford araç ihracat"]],["Finans & Ödeme",["ford dekont raporu","Ford Ödeme Raporu","ford samandıra dekont","aygen ford ödeme listesi"]],["Uyum & Teşvik",["ceza takip raporu (ford)","ford ar-ge raporu","ford yatırım teşvik raporu","ford nihai kullanım raporu","ford ihracat gtip bazlı rapor"]],["Saha & Arşiv",["gümrüklü saha listesi","gümrüklü saha listesi ford dışı antrepo","yp kapı bildirim","arşiv kontrol ford mail"]]],
en:[["Import & Declaration",["Weekly Ford missing-document report","Ford missing-document report","Detailed import reports","Ford declaration report","Ford free-circulation entry list — spare parts","Ford import report","Ford import","Ford statistical value","Ford SCT mail","Ford freight mail","Ford IMEI mail","Duplication control"]],["Export",["Ford export report by GTIP","Ford export report (0100)","Ford Export Report 0100-cargo","Ford Export","Ford spare-parts export report","Ford temporary export","Ford INTAÇ mail","Ford Daily Vehicle Export","Ford export penalty","Ford crate","Ford VW export","Ford vehicle export"]],["Finance & Payment",["Ford receipt report","Ford Payment Report","Ford Samandıra receipt","Aygen Ford payment list"]],["Compliance & Incentives",["Ford penalty tracking report","Ford R&D report","Ford investment-incentive report","Ford end-use report","Ford export report by GTIP"]],["Field & Archive",["Customs field list","Customs field list — non-Ford warehouse","Spare-parts gate notification","Ford archive-control mail"]]]};
const otomailReports=reportCatalog.tr.flatMap((trGroup,categoryIndex)=>trGroup[1].map((trTitle,itemIndex)=>({
  title:{tr:trTitle,en:reportCatalog.en[categoryIndex]?.[1]?.[itemIndex]||trTitle},
  category:{tr:trGroup[0],en:reportCatalog.en[categoryIndex]?.[0]||trGroup[0]}
}))).map((report,index)=>{
  const number=String(index+1).padStart(2,"0");
  return {...report,id:`otomail-${number}`,fileName:`ford_otomail_${number}.xlsx`};
});

const specialData={
tr:{
archiveIndex:["ARCHIVE INDEX","Arşiv Fihrist","Belgeye tarih, referans, süreç ve tip bazlı arama; saniyeler içinde bulma, görüntüleme ve ilgili kayıtla ilişkilendirme.",["Tekil doküman kimliği","Tutarlı metaveri alanları","Versiyon ve işlem geçmişi","Rol bazlı erişim"],"search"],
gate:["CUSTOMS GATE NOTIFICATIONS","Gümrük Kapı Bildirimleri","Gümrük kapı bildirimi; gümrüklü sahaya giren veya sahadan çıkan araç hareketinin çekici ve dorse plakası, beyanname ya da taşıma kaydı, ilgili kapı ve zaman bilgileriyle eşleştirilerek kayıt altına alınmasıdır. Aycube, giriş–çıkış hareketini ilgili gümrük dosyasına bağlar; eksik veya uyumsuz kayıtları görünür hâle getirir ve yetkili ekipler için izlenebilir bir işlem geçmişi oluşturur.",["Çekici ve dorse plakalarının gümrük kaydıyla eşleştirilmesi","Beyanname veya taşıma belgesiyle dosya bağlantısı","Kapı giriş–çıkış tarih ve saatlerinin kayıt altına alınması","Eksik ya da uyumsuz bilgi için kontrol ve uyarı","Yetkili gümrük ve operasyon ekipleri için denetlenebilir işlem izi"],"flow"],
declarationImage:["DECLARATION IMAGE","Bankaya Gönderilen Beyanname Görüntüsü","Tescil beyanname görüntüsünün kontrollü şekilde alınması, bankaya iletilmesi ve gönderim kayıtlarının izlenmesi.",["Manuel e-posta ve ek yönetimini azaltır","Gönderim zamanı ve alıcı logları","Tekrar deneme ve hata uyarısı","Ödeme ve teminat akışlarıyla bağlantı"],"flow"]},
en:{
archiveIndex:["ARCHIVE INDEX","Archive Index","Search by date, reference, process and type; find, view and link documents to the relevant record within seconds.",["Unique document identity","Consistent metadata","Version and activity history","Role-based access"],"search"],
gate:["CUSTOMS GATE NOTIFICATIONS","Customs Gate Notifications","A customs gate notification records a vehicle entering or leaving a customs-controlled site by matching tractor and trailer plates with the declaration or transport record, the relevant gate and timestamps. Aycube links the movement to its customs file, highlights missing or inconsistent data and creates a traceable transaction history for authorised teams.",["Matching tractor and trailer plates with the customs record","Linking the declaration or transport document to the file","Recording gate entry and exit dates and times","Checks and alerts for missing or inconsistent information","Auditable transaction trail for authorised customs and operations teams"],"flow"],
declarationImage:["DECLARATION IMAGE","Declaration Image Sent to Bank","Controlled retrieval, bank delivery and tracking of registered declaration images.",["Reduces manual email and attachment handling","Delivery time and recipient logs","Retry and error alerts","Connection to payment and guarantee flows"],"flow"]}};

const rpaProjectData={
tr:{
berkbot:["AI-POWERED RPA PLATFORM","BerkBOT | Akıllı Otomasyon Platformu","BerkBOT, şirketimiz bünyesinde geliştirdiğimiz yapay zekâ destekli RPA otomasyon platformudur. Tekrarlayan operasyonel süreçleri uçtan uca otomatikleştirirken iş gücü ve zaman tasarrufu sağlar, kullanıcı kaynaklı hataları minimum seviyeye indirmeyi hedefler. Süreçte karşılaştığı hata ve istisnalardan öğrenen yapısı; kontrol setleri, çapraz doğrulama mekanizmaları ve yapay zekâ destekli kontrollerle olası sorunları işlem gerçekleşmeden önce tespit eder, değerlendirir ve mümkün olan durumlarda otomatik olarak düzeltir. Böylece yalnızca işleri otomatikleştiren değil, operasyonel kaliteyi sürekli geliştiren akıllı bir altyapı sunar.",["Tekrarlayan operasyonel işlemlerin uçtan uca otomasyonu","Kullanıcı kaynaklı hataların işlem öncesinde tespiti","Kontrol setleri ve çapraz doğrulama mekanizmaları","Hata ve istisnalardan öğrenen gelişen yapı","Uygun senaryolarda otomatik düzeltme ve kesintisiz tamamlama"],"flow"],
fordBilling:["FORD BULK BILLING AUTOMATION","Ford Toplu Fatura Kesim Sistemi","Ford Toplu Fatura Kesim Sistemi, ay boyunca oluşan masraf ve fatura kalemlerini otomatik analiz eden; verileri cari kod bazında konsolide ederek ay sonunda tek seferde toplu faturalandıran akıllı bir otomasyon çözümüdür. BerkBOT altyapısı üzerinde çalışan sistem, OCR ve yapay zekâ destekli kontrollerle eksik, hatalı veya tutarsız kayıtları belirler; mümkün olan durumlarda otomatik düzeltme uygulayarak süreci kullanıcı müdahalesine ihtiyaç duymadan tamamlar. Faturalandırma sonrasında Muhasebe, Operasyon ve Yönetim ekiplerine cari tutarlar, işlem adetleri, masraf dağılımları ile hata ve istisna kayıtlarını içeren ayrıntılı ve izlenebilir raporlar sunar.",["Aylık masraf ve fatura kalemlerinin otomatik analizi","Cari kod bazında konsolidasyon ve tek seferde toplu faturalandırma","OCR ve yapay zekâ destekli eksik, hata ve tutarsızlık kontrolü","Uygun kayıtlarda otomatik düzeltme ve müdahalesiz tamamlama","Muhasebe, Operasyon ve Yönetim için cari bazlı izlenebilir raporlama"],"flow"],
invoiceOcr:["SMART INVOICE OCR","Akıllı Fatura Ayrıştırma – OCR Servisi","Toplu PDF faturalar OCR teknolojisiyle otomatik olarak analiz edilir ve her belgedeki fatura numarası tespit edilir. Sistem, faturaları Ford, Otokar, Türk Traktör ve Diğerleri klasörlerine ayırır; her faturayı kendi numarasıyla ayrı bir PDF olarak kaydeder. Böylece manuel dosyalama ihtiyacı ortadan kalkar, belge karışıklığı azalır ve operasyon ekipleri işlenmeye hazır faturalara daha hızlı ulaşır.",["Toplu PDF faturaların tek işlemde OCR ile analizi","Fatura numarasının belge üzerinden otomatik tespiti","Ford ve ilgili firma klasörlerine kural bazlı ayrıştırma","Her faturanın kendi numarasıyla ayrı PDF olarak kaydedilmesi","Manuel dosyalamanın kaldırılması ve operasyon süresinin kısalması"],"flow"]},
en:{
berkbot:["AI-POWERED RPA PLATFORM","BerkBOT | Intelligent Automation Platform","BerkBOT is our in-house AI-powered RPA automation platform. It automates repetitive operational processes end to end, saving workforce capacity and time while minimising user-driven errors. Its learning structure evaluates errors and exceptions encountered during a process; control sets, cross-validation mechanisms and AI-assisted checks identify potential issues before execution and automatically correct them whenever possible. BerkBOT therefore provides an intelligent foundation that continuously improves operational quality rather than simply automating tasks.",["End-to-end automation of repetitive operational tasks","Pre-transaction detection of user-driven errors","Control sets and cross-validation mechanisms","A structure that learns from errors and exceptions","Automatic correction and unattended completion where applicable"],"flow"],
fordBilling:["FORD BULK BILLING AUTOMATION","Ford Bulk Billing System","The Ford Bulk Billing System automatically analyses expense and invoice items accumulated throughout the month, consolidates them by account code and generates bulk billing in a single month-end run. Operating on the BerkBOT platform, the system uses OCR and AI-assisted controls to detect missing, incorrect or inconsistent records and applies automatic corrections whenever possible, completing the process without user intervention. After billing, it provides Accounting, Operations and Management teams with detailed, traceable reports covering account-based amounts, transaction counts, expense distributions, errors and exceptions.",["Automated analysis of monthly expense and invoice items","Account-code consolidation and single-run bulk billing","OCR and AI-assisted checks for missing, incorrect or inconsistent data","Automatic correction and unattended completion where applicable","Traceable account-based reporting for Accounting, Operations and Management"],"flow"],
invoiceOcr:["SMART INVOICE OCR","Smart Invoice Separation – OCR Service","Bulk PDF invoices are analysed automatically with OCR technology and the invoice number on each document is detected. The service separates invoices into Ford, Otokar, Türk Traktör and Other folders, then saves every invoice as an individual PDF named with its invoice number. This removes manual filing, reduces document mix-ups and helps operations teams reach processing-ready invoices faster.",["OCR analysis of bulk PDF invoices in a single run","Automatic detection of the invoice number","Rule-based separation into Ford and related company folders","Each invoice saved as an individual PDF with its own number","Removal of manual filing and a shorter operational cycle"],"flow"]}};

const rpaProjectScreens={
  invoiceOcr:[{
    src:"assets/ocr/akilli-fatura-ayristirma-ocr.png",
    label:{tr:"OCR Servisleri uygulama ekranı",en:"OCR Services application screen"},
    meta:{tr:"Gerçek proje ekranı",en:"Real project screen"},
    description:{
      tr:"Operasyon kullanıcısı toplu PDF dosyalarını seçer; servis belgeleri OCR ile işler, fatura numaralarını bulur ve ayrıştırılan faturaları ilgili klasöre ayrı PDF'ler halinde kaydeder.",
      en:"The operations user selects bulk PDF files; the service processes them with OCR, detects invoice numbers and saves the separated invoices as individual PDFs in the relevant folder."
    }
  }]
};

const specialScreens={
  archiveIndex:[
    {src:"assets/aycube_screens/arsiv-fihrist.png",label:{tr:"Arşiv Fihrist",en:"Archive Index"}},
    {src:"assets/aycube_screens/arsiv-dosya-yukleme.png",label:{tr:"Dosya Yükleme ve Belge Eşleştirme",en:"File Upload and Document Matching"}}
  ],
  gate:[
    {src:"assets/aycube_screens/gecici-ithalat-takip.png",label:{tr:"Gümrük Süreç Takibi",en:"Customs Process Tracking"},description:{tr:"Gümrük dosyasına bağlı hareket, durum ve süre bilgilerinin aynı kayıt üzerinden izlenebildiği takip görünümü.",en:"A tracking view where movement, status and duration data linked to the customs file can be monitored in one record."}},
    {src:"assets/aycube_screens/ihracat-beyanname-raporu.png",label:{tr:"İhracat Beyanname ve Çıkış Kayıtları",en:"Export Declaration and Exit Records"},description:{tr:"Kapı çıkışında kontrol edilen beyanname, sevkiyat ve sonuç alanlarını birlikte gösteren gümrük raporu.",en:"A customs report combining the declaration, shipment and result fields checked during gate exit."}},
    {src:"assets/aycube_screens/ithalat-beyanname-raporu-detayli.png",label:{tr:"Detaylı Araç ve Beyanname Bilgileri",en:"Detailed Vehicle and Declaration Data"},description:{tr:"Plaka ve gümrük dosyası eşleşmesinin doğrulanmasında kullanılan ayrıntılı beyanname ve operasyon alanları.",en:"Detailed declaration and operational fields used to validate the match between the plate and customs file."}}
  ],
  declarationImage:[
    {src:"assets/aycube_screens/arsiv-dosya-yukleme.png",label:{tr:"Beyanname Görüntüsü Dosya Akışı",en:"Declaration Image File Flow"}},
    {src:"assets/aycube_screens/arsiv-fihrist.png",label:{tr:"Arşiv Kayıt Eşleşmesi",en:"Archive Record Match"}}
  ]
};

const speakerScripts={
tr:[
"Açılış mesajı tek: Aygen IT; entegrasyon, otomasyon, raporlama ve saha görünürlüğünü Ford operasyonları için tek dijital omurgada birleştiriyor. 29 proje ve 37 rapor akışı, dağınık çözümler değil, aynı ölçeklenebilir ekosistemin parçalarıdır.",
"Hikâyeyi beş eksende kuruyoruz: net sahiplik, tek platform, otomasyonla güçlenen karar ritmi, güvenlik ve sürdürülebilirlik. Her eksen, bir sonrakinin zeminini hazırlıyor.",
"Bu bölüm teknolojiyi kimin taşıdığını gösteriyor. Beş farklı uzmanlık aynı teslimat sorumluluğunda birleşiyor: liderlik, yazılım, analiz, RPA ve yapay zekâ. Kartları açarak her ekip üyesinin ana katkısını vurgulayabilirsiniz.",
"İş birliği modelimizin farkı ortak ve sürdürülebilir sonuç üretme ritmidir. Yakın çalışma ile başlayan süreç; analiz, geliştirme, güvenli mimari, hızlı iterasyon ve kontrollü teslimat adımlarıyla ilerler. Böylece Ford operasyonlarında karar süresi kısalır, güvenilir ve anlamlı veriye daha hızlı ulaşılır.",
"Aycube bölümünde ana mesaj tek platform mantığı. Ford için geliştirilen 29 proje; gümrük takip, entegrasyon, otomasyon, finans ve arşiv başlıklarında toplanıyor. Kartlara tıklandığında gerçek ekranlar ve proje detayları açılıyor.",
"Otomail, Ford Otosan ekipleri için hazırlanan 37 operasyonel raporu zamanında üreten, doğrulayan ve yalnızca yetkili alıcılara güvenle ulaştıran otomatik rapor dağıtım servisidir. Akış 37 raporun tamamını sırayla gösterir. Günlük yaklaşık 40, haftalık 280, aylık ortalama 1.223 ve yıllık yaklaşık 14.671 rapor gönderimi; teslim kayıtları, hata uyarıları ve izlenebilir yeniden denemelerle yönetilir.",
"BerkBOT, Aygen bünyesinde geliştirdiğimiz yapay zekâ destekli RPA platformudur. Tekrarlayan süreçleri otomatikleştirirken kontrol setleri, çapraz doğrulama ve öğrenen hata yönetimiyle operasyonel kaliteyi artırır. Ford Toplu Fatura Kesim Sistemi, aylık masraf ve fatura kalemlerini cari bazında konsolide edip ay sonunda toplu faturalandırır. Akıllı Fatura Ayrıştırma OCR Servisi ise toplu PDF faturaları analiz eder, fatura numarasını bulur, belgeleri firma klasörlerine ayırır ve her faturayı kendi numarasıyla ayrı bir PDF olarak kaydeder. Sağdaki ana akış, robotun işlemi yürüttüğü, OCR’ın veriyi doğruladığı ve sonucun Aycube veya ERP’ye aktarıldığı yapıyı gösteriyor.",
"Dört kritik entegrasyon alanı aynı veri prensipleri üzerinde çalışıyor: ortak veri, kural bazlı doğrulama ve izlenebilir teslimat. İhracat sekmesindeki kamyon akışı; araç, sevkiyat ve beyanname verilerini tek kayıtta eşleştiriyor, zorunlu alanları doğruluyor ve tescilden çıkış ile intaç durumuna kadar süreci Ford ekipleri için görünür hâle getiriyor. Yüzde yerine kapsamı göstererek doğrulanmamış KPI’larla güven zedelemiyoruz.",
"Özel projelerde sahadaki somut ihtiyaçlara üretilen nokta çözümleri gösteriyoruz: arşiv fihrist, gümrük kapı bildirimleri ve bankaya giden beyanname görüntüleri. Buradaki kapı bildirimi Supalan süreci değildir; gümrüklü sahaya giren veya sahadan çıkan aracın plaka, beyanname ya da taşıma kaydı, kapı ve zaman bilgileriyle eşleştirilerek ilgili gümrük dosyasına bağlanmasıdır. Böylece eksik veya uyumsuz hareketler görünür, yetkili ekipler için denetlenebilir bir işlem izi oluşur.",
"Supalan bölümünde fiziksel saha ile dijital kontrolü birlikte görüyoruz. Araç ve şoför bilgileri tır giriş formunda toplanıp Aycube’da kayıt altında tutuluyor; giriş ve çıkışlar plaka tanıma, güvenlik kontrolü ve sisteme entegre 40 kameralı altyapıyla izleniyor. Gümrüklü araçlarda vergi ödemesi ve ilgili gümrük adımları tamamlanana kadar bekleme statüsü takip ediliyor. Giriş, çıkış ve transit sürelerini içeren raporlarımız Ford’a zaman görünürlüğü sağlıyor; demurajı Aygen veya Aycube hesaplamıyor, Ford ekipleri değerlendirmeyi bu raporlardaki verilerle yapıyor. Olay bildirimleri ile ithalat ve ihracat raporları yetkili ekiplere e-posta yoluyla iletiliyor. Ekrandaki sayısal veriler örnektir.",
"Kapanış, veriyle görünür hale gelen operasyonun artık somut aksiyona dönüşebileceğini vurguluyor. Aygen IT ve Ford Otosan iş birliğini, geleceği birlikte şekillendiren uzun vadeli bir ortaklık mesajıyla tamamlıyoruz."
],
en:[
"The opening message is simple: Aygen IT unifies integration, automation, reporting and field visibility into one digital backbone for Ford operations. The 29 projects and 37 report flows are parts of the same scalable ecosystem.",
"The story follows five pillars: clear ownership, one platform, an automation-powered decision rhythm, security and sustainability. Each pillar creates the foundation for the next.",
"This section shows who carries the work. Five disciplines share one delivery responsibility: leadership, software, analysis, RPA and AI. Open the cards to highlight each person’s core contribution.",
"The differentiator is a shared rhythm focused on sustainable outcomes. Starting with close collaboration, the process moves through analysis, development, secure architecture, fast iteration and controlled delivery. This shortens decision cycles and provides Ford operations with faster access to reliable, meaningful data.",
"The Aycube section communicates the single-platform logic. The 29 Ford projects are grouped under customs tracking, integration, automation, finance and archive capabilities. Each card opens real screens and project details.",
"Otomail is the automated report-distribution service that generates and validates 37 operational reports for Ford Otosan teams, then securely delivers them only to authorised recipients. The flow cycles through all 37 reports in sequence. Approximately 40 daily, 280 weekly, 1,223 monthly and 14,671 yearly deliveries are managed with delivery logs, error alerts and traceable retries.",
"BerkBOT is the AI-powered RPA platform developed in-house at Aygen. It automates repetitive processes while improving operational quality through control sets, cross-validation and learning-based exception handling. The Ford Bulk Billing System consolidates monthly expense and invoice items by account and completes bulk billing at month end. The Smart Invoice Separation OCR Service analyses bulk PDF invoices, detects invoice numbers, separates documents into company folders and saves each invoice as an individual PDF named with its own number. The main flow on the right shows the robot executing the process, OCR validating the data and the verified result being transferred to Aycube or ERP.",
"Four critical integration areas share the same principles: common data, rule-based validation and traceable delivery. The truck-export flow matches vehicle, shipment and declaration data in one record, validates mandatory fields and gives Ford teams visibility from registration through exit and closure. The slide shows scope instead of unverified percentages, preserving executive credibility.",
"Special projects show targeted solutions for concrete operational needs: archive index, customs gate notifications and declaration images sent to the bank. The gate notification shown here is not the Supalan process; it links a vehicle entering or leaving a customs-controlled site to its customs file through plate, declaration or transport record, gate and timestamp data. Missing or inconsistent movements become visible and authorised teams receive an auditable transaction trail.",
"The Supalan section brings the physical site and digital control together. Vehicle and driver data is collected through the truck-entry form and retained in Aycube; entry and exit are monitored through plate recognition, security checks and an integrated 40-camera infrastructure. Customs-controlled vehicles remain in a waiting status until tax payment and the relevant customs steps are complete. Our entry, exit and transit-duration reports give Ford time visibility; Aygen and Aycube do not calculate demurrage, and Ford teams make that assessment using the report data. Event notifications and import / export reports are delivered to authorised teams by email. The figures shown are illustrative.",
"The close emphasizes that operational visibility can now become concrete action. It completes the Aygen IT and Ford Otosan story with a long-term partnership message focused on shaping the future together."
]
};
function updateSpeakerNotes(){
  if(!notesPanel||!notesTitle||!notesText)return;
  notesTitle.textContent=`${String(current+1).padStart(2,"0")} — ${titleFor(current)}`;
  notesText.textContent=(speakerScripts[lang]&&speakerScripts[lang][current])||"";
}
function toggleSpeakerNotes(force){
  if(!notesPanel)return;
  const open=force!==undefined?force:!notesPanel.classList.contains("is-open");
  notesPanel.classList.toggle("is-open",open);
  notesPanel.setAttribute("aria-hidden",open?"false":"true");
  if(open) updateSpeakerNotes();
}

const titleFor=i=>slides[i].dataset[lang==="tr"?"titleTr":"titleEn"];

function prewarmSlide(index){
  if(index<0||index>=slides.length||index===current)return;
  const slide=slides[index];
  slide.classList.add("is-prewarming");
  // Keep the invisible layer alive long enough for first paint/rasterization.
  setTimeout(()=>slide.classList.remove("is-prewarming"),320);
}
function scheduleAdjacentWarmup(center=current){
  const run=()=>{prewarmSlide(center+1);setTimeout(()=>prewarmSlide(center-1),90)};
  if("requestIdleCallback" in window) requestIdleCallback(run,{timeout:450});
  else setTimeout(run,120);
}

function commitSlide(index){
current=Math.max(0,Math.min(index,slides.length-1));
slides.forEach((slide,i)=>{slide.classList.toggle("is-active",i===current);slide.classList.toggle("is-before",i<current)});
const app=$(".app");
const activeSlide=slides[current];
activeSlide.classList.remove("is-prewarming");
slides.forEach(slide=>slide.classList.remove("is-reveal-complete"));
app?.classList.remove("is-dark-slide");
app?.classList.toggle("is-opening",current===0);
app?.classList.toggle("is-closing",current===slides.length-1);
progressBar.style.width=`${((current+1)/slides.length)*100}%`;
currentNo.textContent=String(current+1).padStart(2,"0");
prevBtn.disabled=current===0;nextBtn.disabled=current===slides.length-1;sectionName.textContent=titleFor(current);
updateSpeakerNotes();
if(window.matchMedia("(max-width: 1120px)").matches){
  requestAnimationFrame(()=>window.scrollTo(0,0));
}
}
function navigate(index,useCurtain=true){
const next=Math.max(0,Math.min(index,slides.length-1));if(next===current||busy)return;
if(!useCurtain||window.matchMedia("(prefers-reduced-motion: reduce)").matches){commitSlide(next);return}
const app=$(".app");
busy=true;app?.classList.add("is-transitioning");transitionStage.classList.toggle("is-reverse",next<current);transitionNumber.textContent=String(next+1).padStart(2,"0");transitionName.textContent=titleFor(next);
transitionStage.classList.remove("is-running");void transitionStage.offsetWidth;transitionStage.classList.add("is-running");
setTimeout(()=>commitSlide(next),330);setTimeout(()=>{transitionStage.classList.remove("is-running");app?.classList.remove("is-transitioning");busy=false;scheduleAdjacentWarmup(current)},870);
}
function buildOverview(){
overviewGrid.innerHTML=slides.map((s,i)=>`<button class="overview-card" data-index="${i}" type="button"><span>${String(i+1).padStart(2,"0")}</span><strong>${titleFor(i)}</strong></button>`).join("");
overviewGrid.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{overview.classList.remove("is-open");navigate(Number(b.dataset.index))}));
}
function renderPartnership(key,animate=true){
const d=partnershipData[lang][key],panel=$("#partnershipDetail"),step=partnershipKeys.indexOf(key)+1;
if(!d||!panel||step<1)return;
$$(".engine-node").forEach(card=>{const active=card.dataset.partnership===key;card.classList.toggle("is-active",active);card.setAttribute("aria-expanded",String(active))});
$("#partnershipStep").textContent=String(step).padStart(2,"0");
$("#partnershipDetailCode").textContent=d[0];
$("#partnershipDetailTitle").textContent=d[1];
$("#partnershipDetailText").textContent=d[2];
panel.style.setProperty("--step-progress",`${step/partnershipKeys.length*100}%`);
panel.classList.remove("is-collapsed");
if(animate)panel.animate([{opacity:.35,transform:"translateY(-10px) scale(.985)"},{opacity:1,transform:"translateY(0) scale(1)"}],{duration:480,easing:"cubic-bezier(.22,1,.36,1)"});
}
function closePartnership(){
const panel=$("#partnershipDetail");if(!panel)return;
panel.classList.add("is-collapsed");
$$(".engine-node").forEach(card=>{card.classList.remove("is-active");card.setAttribute("aria-expanded","false")});
}
function togglePartnership(button){
const panel=$("#partnershipDetail"),isOpen=button.classList.contains("is-active")&&!panel?.classList.contains("is-collapsed");
if(isOpen)closePartnership();else renderPartnership(button.dataset.partnership);
}
function renderIntegration(key){
const d=integrationData[lang][key];
$("#integrationCode").textContent=d.code;$("#integrationTitle").textContent=d.title;$("#integrationDescription").textContent=d.description;
const flowColumns=$("#flowColumns");
flowColumns.classList.toggle("is-three",d.cards.length===3);
flowColumns.innerHTML=d.cards.map(c=>`<article class="flow-card"><span>${c[0]}</span><h4>${c[1]}</h4><p>${c[2]}</p></article>`).join("");
$(".integration-stage").animate([{opacity:.45,transform:"translateY(10px)"},{opacity:1,transform:"translateY(0)"}],{duration:420,easing:"cubic-bezier(.22,1,.36,1)"});
}
function demoMarkup(type){
if(type==="search")return`<div class="demo-search"><span>${lang==="tr"?"FORD / 2026 / Beyanname / Referans...":"FORD / 2026 / Declaration / Reference..."}</span><b>${lang==="tr"?"0,4 sn":"0.4 sec"}</b></div>`;
if(type==="mail")return`<div class="demo-flow"><div>${lang==="tr"?"Rapor Üret":"Generate"}</div><div>${lang==="tr"?"Doğrula":"Validate"}</div><div>${lang==="tr"?"Dağıt":"Deliver"}</div></div>`;
return`<div class="demo-flow"><div>${lang==="tr"?"Veri Al":"Receive Data"}</div><div>${lang==="tr"?"Kontrol Et":"Validate"}</div><div>${lang==="tr"?"İzle & Raporla":"Track & Report"}</div></div>`;
}
function modalScreenMarkup(item,variant){
  const label=item.label?.[lang]||item.title?.[lang]||(lang==="tr"?"Aycube ekranı":"Aycube screen");
  const meta=item.meta?.[lang]||(lang==="tr"?"Gerçek Aycube ekranı":"Real Aycube screen");
  const detail=item.description?.[lang]||projectScreenDetails[item.src]?.[lang]||"";
  const detailControl=detail?`<button class="screen-detail-toggle" type="button" aria-expanded="false"><span>${lang==="tr"?"Detayı aç":"Open details"}</span><i aria-hidden="true"></i></button>`:"";
  const detailBody=detail?`<div class="screen-detail-body"><div><p>${detail}</p></div></div>`:"";
  return `<figure class="modal-gallery-${variant}">
    <button class="screen-preview" type="button" aria-label="${label} — ${lang==="tr"?"görseli büyüt":"enlarge image"}"><img src="${item.src}" alt="${label}" /></button>
    <figcaption><div><strong>${label}</strong><small>${meta}</small></div>${detailControl}</figcaption>
    ${detailBody}
  </figure>`;
}
function renderModalGallery(items=[]){
  const gallery=$("#modalGallery");
  if(!gallery) return;
  if(!items.length){gallery.innerHTML="";gallery.classList.remove("has-gallery");return;}
  const [hero,...rest]=items;
  gallery.classList.add("has-gallery");
  gallery.innerHTML=`${modalScreenMarkup(hero,"hero")}${rest.length?`<div class="modal-gallery-strip">${rest.map(item=>modalScreenMarkup(item,"thumb")).join("")}</div>`:""}`;
}
function resetInfoModalMode(){
  infoModal.classList.remove("catalog-mode","project-group-mode","supalan-feature-mode","supalan-report-mode");
  delete infoModal.dataset.projectKey;
}
function projectItemsMarkup(key){
  return (projectItems[key]||[]).map((item,index)=>`
    <article class="project-detail-card">
      <button class="project-detail-toggle" type="button" aria-expanded="false">
        <span>${String(index+1).padStart(2,"0")}</span>
        <strong>${item.title[lang]}</strong>
        <i aria-hidden="true"></i>
      </button>
      <div class="project-detail-body"><div><p>${item.description[lang]}</p></div></div>
    </article>`).join("");
}
function openProjectGroup(key){
  const d=projectData[lang][key],items=projectItems[key]||[],screens=projectScreens[key]||[];
  resetInfoModalMode();
  infoModal.classList.add("project-group-mode");
  infoModal.dataset.projectKey=key;
  $("#modalCode").textContent=d[0];
  $("#modalTitle").textContent=d[1];
  $("#modalText").textContent=d[2];
  renderModalGallery(screens);
  $("#modalPoints").innerHTML=projectItemsMarkup(key);
  const summaryTitle=items.length?`${items.length} ${lang==="tr"?"proje":"projects"}`:`${screens.length} ${lang==="tr"?"ekran örneği":"screen examples"}`;
  $("#modalDemo").innerHTML=`<div class="project-group-summary"><strong>${summaryTitle}</strong><span>${lang==="tr"?"Açıklama için detay düğmesini, ekranı büyütmek için görseli seçin.":"Select the details button for context or the image to enlarge the screen."}</span></div>`;
  infoModal.showModal();
}
function openInfo(d,galleryItems=[]){resetInfoModalMode();$("#modalCode").textContent=d[0];$("#modalTitle").textContent=d[1];$("#modalText").textContent=d[2];renderModalGallery(galleryItems);$("#modalPoints").innerHTML=d[3].map(p=>`<div>${p}</div>`).join("");$("#modalDemo").innerHTML=demoMarkup(d[4]);infoModal.showModal()}
function openCatalog(code,title,description,groups){resetInfoModalMode();infoModal.classList.add("catalog-mode");$("#modalCode").textContent=code;$("#modalTitle").textContent=title;$("#modalText").textContent=description;renderModalGallery([]);$("#modalPoints").innerHTML=groups.map(g=>`<section class="catalog-group"><h4>${g[0]} <span>${g[1].length}</span></h4><div class="catalog-items">${g[1].map((item,index)=>`<div><b>${String(index+1).padStart(2,"0")}</b><span>${item}</span></div>`).join("")}</div></section>`).join("");$("#modalDemo").innerHTML="";infoModal.showModal()}

const supalanImages=[
  {src:"assets/supalan/supalan-1.jpg",caption:{tr:"Drone çekimi • Genel saha görünümü",en:"Drone shot • Overall field view"}},
  {src:"assets/supalan/supalan-2.jpg",caption:{tr:"Sahaya giriş aksı ve park dizilimi",en:"Entry axis and parking layout"}},
  {src:"assets/supalan/supalan-3.jpg",caption:{tr:"Operasyon alanı ve çevresel görünürlük",en:"Operation area and surrounding visibility"}},
  {src:"assets/supalan/supalan-4.jpg",caption:{tr:"Aygen markalı saha görünümü",en:"Aygen-branded site view"}}
];
const supalanWebScreens=[
  {src:"assets/aycube_screens/supalan-giris-formu.png",title:{tr:"Supalan Giriş Formu",en:"Supalan Entry Form"}},
  {src:"assets/aycube_screens/supalan-liste.png",title:{tr:"Supalan Liste",en:"Supalan List"}}
];
const supalanReportScreens=[
  {
    src:"assets/supalan/supalan-email-rapor-akisi.png",
    label:{tr:"Supalan bildirim e-postaları ve Excel raporları",en:"Supalan notification emails and Excel reports"},
    meta:{tr:"Gerçek e-posta ve rapor örnekleri",en:"Real email and report samples"},
    description:{
      tr:"Aycube’da oluşan saha kayıtları, yetkili ekiplerin operasyonu izlemesi için olay bazlı e-posta bildirimlerine ve ithalat / ihracat Excel raporlarına dönüştürülür.",
      en:"Field records created in Aycube are converted into event-based email notifications and import / export Excel reports so authorised teams can monitor the operation."
    }
  }
];
const supalanFeatureData={
  tr:{
    security:["SAHA GÜVENLİĞİ","Güvenlik & Giriş–Çıkış Kontrolü","Supalan sahasında araç hareketleri, fiziksel güvenlik kontrol noktaları, plaka tanıma ve sisteme entegre 40 kameralı yoğun güvenlik altyapısıyla izlenir. Giriş ve çıkış zamanları kayıt altına alınarak yetkili ekipler için geriye dönük, denetlenebilir bir olay izi oluşturulur.",["Plaka tanıma ile araç ve kayıt eşleştirmesi","40 kamera ile yoğun saha gözetimi","Yetkili güvenlik kontrolü ve kontrollü geçiş","Giriş–çıkış saatlerinin Aycube kaydına bağlanması","İnceleme gerektiğinde geriye dönük olay görünürlüğü"],"flow"],
    registration:["AYCUBE SAHA KAYDI","Tır, Araç & Şoför Bilgileri","Supalan tır giriş formunda çekici ve dorse plakası, araç tipi, nakliye firması, sürücü bilgileri, yükleme noktası, gümrük tipi ve ilgili operasyon alanı tek kayıtta toplanır. Bilgiler Aycube’da saklanır; saha ekipleri aynı güncel kayıt üzerinden ilerler.",["Tır çekici ve dorse plaka bilgileri","Araç tipi, marka ve nakliye firması","Şoför adı ve gerekli iletişim bilgileri","Gümrük tipi, statüsü ve ilgili lokasyon","Tekil evrak numarasıyla izlenebilir Aycube kaydı"],"flow"],
    customs:["GÜMRÜK & BEKLEME","Vergi Onayı ve Demuraj Görünürlüğü","Gümrüklü araçlarda süreç, gerekli vergi ödemesi ve gümrük adımları tamamlanana kadar bekleme statüsünde izlenir. Giriş, çıkış ve transit sürelerini içeren raporlarımız Ford tarafına zaman ve hareket görünürlüğü sağlar. Demurajı Aygen veya Aycube hesaplamaz; demuraj tespiti ve değerlendirmesi, sunduğumuz raporlardaki veriler kullanılarak Ford tarafından yapılır.",["Gümrük statüsü ve vergi ödeme beklemesinin takibi","Giriş, çıkış ve transit zaman damgaları","Bekleyen araçların operasyonel görünürlüğü","Ford ekiplerine düzenli süre ve hareket raporu","Demuraj hesabı değil, karara temel olan güvenilir veri"],"flow"],
    reporting:["GÜVENLİ RAPORLAMA","E-posta Bildirimleri & Rapor Akışı","Aycube’da kaydedilen saha olayları, supalan@aycube.com üzerinden yetkili ekiplere bildirim olarak iletilir. Araç ve şoför detayları olay e-postasında görünür; ithalat ve ihracat kayıtları ayrıca Excel raporlarıyla paylaşılır. Böylece Ford ekipleri saha hareketlerini güncel, izlenebilir ve kanıta dayalı biçimde takip eder.",["Olay bazlı araç ve saha bildirimleri","Supalan ithalat raporunun Excel olarak iletimi","Supalan ihracat raporunun Excel olarak iletimi","Yetkili alıcılarla kontrollü bilgi paylaşımı","E-posta ve raporlar üzerinden izlenebilir operasyon kaydı"],"mail"]
  },
  en:{
    security:["FIELD SECURITY","Security & Entry–Exit Control","Vehicle movements at the Supalan site are monitored through physical checkpoints, plate recognition and an integrated high-security network of 40 cameras. Entry and exit timestamps are recorded, creating an auditable event trail for authorised teams.",["Vehicle-to-record matching through plate recognition","Intensive field monitoring with 40 cameras","Authorised security checks and controlled access","Linking entry–exit timestamps to the Aycube record","Retrospective event visibility when review is required"],"flow"],
    registration:["AYCUBE FIELD RECORD","Truck, Vehicle & Driver Data","The Supalan truck-entry form collects tractor and trailer plates, vehicle type, carrier, driver details, loading point, customs type and the relevant operational location in a single record. The data is retained in Aycube so field teams work from the same current record.",["Tractor and trailer plate data","Vehicle type, make and carrier","Driver name and required contact details","Customs type, status and relevant location","Traceable Aycube record with a unique document number"],"flow"],
    customs:["CUSTOMS & WAITING","Tax Approval and Demurrage Visibility","For customs-controlled vehicles, the process remains in a waiting status until the required tax payment and customs steps are completed. Reports containing entry, exit and transit durations give Ford visibility into time and movement. Aygen and Aycube do not calculate demurrage; Ford determines and evaluates demurrage using the data supplied in these reports.",["Tracking customs status and tax-payment waiting","Entry, exit and transit timestamps","Operational visibility for waiting vehicles","Regular duration and movement reports for Ford teams","Reliable decision data rather than a demurrage calculation"],"flow"],
    reporting:["SECURE REPORTING","Email Notifications & Report Flow","Field events recorded in Aycube are sent to authorised teams from supalan@aycube.com. Vehicle and driver details appear in event emails, while import and export records are also shared as Excel reports. Ford teams can therefore track field movements through current, traceable and evidence-based records.",["Event-based vehicle and field notifications","Supalan import report delivered as Excel","Supalan export report delivered as Excel","Controlled information sharing with authorised recipients","Traceable operational record through emails and reports"],"mail"]
  }
};
function supalanFeatureGallery(key){
  if(key==="security") return supalanImages.map(item=>({src:item.src,label:item.caption,meta:{tr:"Gerçek saha görüntüsü",en:"Real field image"}}));
  if(key==="registration") return supalanWebScreens;
  if(key==="reporting") return supalanReportScreens;
  return [];
}
function openSupalanFeature(key){
  openInfo(supalanFeatureData[lang][key],supalanFeatureGallery(key));
  infoModal.classList.add("supalan-feature-mode");
  if(key==="reporting") infoModal.classList.add("supalan-report-mode");
}
let supalanCurrent=0,supalanTimer=null;
function setSupalanImage(index){
  const hero=$("#supalanHero"),caption=$("#supalanCaption"),thumbs=$$(".supalan-thumb");
  if(!hero||!thumbs.length)return;
  supalanCurrent=(index+supalanImages.length)%supalanImages.length;
  const item=supalanImages[supalanCurrent];
  hero.style.opacity=".45";
  setTimeout(()=>{hero.src=item.src;hero.style.opacity="1"},120);
  if(caption)caption.textContent=item.caption[lang];
  thumbs.forEach((thumb,i)=>thumb.classList.toggle("is-active",i===supalanCurrent));
}
function startSupalanAutoplay(){
  if(!$("#supalanHero")) return;
  if(supalanTimer) clearInterval(supalanTimer);
  supalanTimer=setInterval(()=>setSupalanImage(supalanCurrent+1),4200);
}


const flowText={
  tr:{
    ready:"Hazır",queued:"Sırada",generating:"Üretiliyor",validating:"Doğrulanıyor",sending:"Gönderiliyor",sent:"Gönderildi",failed:"Hata",
    otomailReady:"Güvenli rapor akışı hazır",otomailRunning:"Güvenli gönderim",otomailComplete:"37 raporun tamamı güvenle gönderildi",runAgain:"Akışı Yeniden Çalıştır",runFlow:"Akışı Çalıştır",
    robotReady:"Hazır",robotRunning:"Çalışıyor",robotComplete:"Tamamlandı",robotRun:"Robot Akışını Çalıştır",robotAgain:"Akışı Yeniden Çalıştır",
    registered:"Giriş kaydı",waiting:"Bekliyor",processing:"İşlemde",complete:"Tamamlandı",
    vehicleImport:"Araç İthalat",vehicleExport:"Araç İhracat",spareParts:"Yedek Parça",documentTransfer:"Evrak Transferi",
    truckAdded:"Yeni tır kaydı oluşturuldu",truckAddedText:"Plaka ve operasyon bilgisi örnek tabloya eklendi."
  },
  en:{
    ready:"Ready",queued:"Queued",generating:"Generating",validating:"Validating",sending:"Sending",sent:"Sent",failed:"Failed",
    otomailReady:"Secure report flow ready",otomailRunning:"Secure delivery",otomailComplete:"All 37 reports delivered securely",runAgain:"Run Flow Again",runFlow:"Run Flow",
    robotReady:"Ready",robotRunning:"Running",robotComplete:"Completed",robotRun:"Run Robot Flow",robotAgain:"Run Flow Again",
    registered:"Entry record",waiting:"Waiting",processing:"Processing",complete:"Completed",
    vehicleImport:"Vehicle Import",vehicleExport:"Vehicle Export",spareParts:"Spare Parts",documentTransfer:"Document Transfer",
    truckAdded:"New truck record created",truckAddedText:"Plate and operation data were added to the sample table."
  }
};
const fileIconByType={xlsx:"assets/icons/excel.svg"};
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let otomailRunning=false,otomailRunNo=0,robotRunning=false;

function setReportState(row,state){
  row.dataset.state=state;
  row.classList.toggle("is-processing",["generating","validating","sending"].includes(state));
  row.classList.toggle("is-sent",state==="sent");
  row.classList.toggle("is-failed",state==="failed");
  const status=row.querySelector(".report-status");
  status.className=`report-status state-${state}`;
  status.textContent=flowText[lang][state]||state;
}
function bindOtomailReportRow(row,reportIndex){
  const report=otomailReports[reportIndex];if(!row||!report)return;
  const number=String(reportIndex+1).padStart(2,"0"),icon=row.querySelector(".report-icon img");
  row.dataset.reportId=report.id;
  row.dataset.reportIndex=String(reportIndex);
  row.dataset.fileType="xlsx";
  row.dataset.fileName=report.fileName;
  if(icon){icon.src=fileIconByType.xlsx;icon.alt=lang==="tr"?"Excel raporu":"Excel report"}
  row.querySelector("strong").textContent=report.title[lang];
  row.querySelector("small").textContent=`${number} / ${otomailReports.length} · ${report.category[lang]}`;
}
function renderOtomailWindow(currentIndex,animate=true){
  const rows=$$(".report-row"),list=$("#reportList"),lastStart=Math.max(0,otomailReports.length-rows.length),start=Math.min(currentIndex,lastStart);
  rows.forEach((row,slot)=>{
    const reportIndex=start+slot;
    bindOtomailReportRow(row,reportIndex);
    setReportState(row,reportIndex<currentIndex?"sent":reportIndex===currentIndex?"ready":"queued");
    row.classList.toggle("is-current",reportIndex===currentIndex);
  });
  if(animate&&currentIndex>0&&currentIndex<=lastStart)list?.animate([{opacity:.5,transform:"translateY(9px)"},{opacity:1,transform:"translateY(0)"}],{duration:280,easing:"cubic-bezier(.22,1,.36,1)"});
  return rows[currentIndex-start];
}
function setPipelineStage(stageIndex){
  $$(".pipeline-node").forEach((node,index)=>{
    node.classList.toggle("is-active",index===stageIndex);
    node.classList.toggle("is-complete",index<stageIndex);
  });
}
function setMailPacket(row,stageIndex,visible=true){
  const packet=$("#mailPacket"),icon=$("#mailPacketIcon"),label=$("#mailPacketLabel");
  icon.src=fileIconByType.xlsx;
  icon.alt=lang==="tr"?"Rapor":"Report";
  label.textContent=lang==="tr"?"RAPOR":"REPORT";
  packet.style.left=["16%","50%","84%"][Math.max(0,Math.min(stageIndex,2))];
  packet.classList.toggle("is-visible",visible);
}
function updateOtomailMeta(state,fileName="",reportIndex=0){
  const meta=$("#otomailRunMeta");
  meta.dataset.state=state;
  meta.dataset.fileName=fileName;
  meta.dataset.reportIndex=String(reportIndex);
  if(state==="running") meta.textContent=`${String(reportIndex+1).padStart(2,"0")} / ${otomailReports.length} · ${otomailReports[reportIndex]?.title[lang]||""} · ${flowText[lang].otomailRunning}`;
  else if(state==="complete") meta.textContent=`37 / 37 · ${flowText[lang].otomailComplete}`;
  else meta.textContent=`37 ${lang==="tr"?"Rapor":"Reports"} · ${flowText[lang].otomailReady}`;
}
function refreshOtomailLanguage(){
  $$(".report-row").forEach(row=>{bindOtomailReportRow(row,Number(row.dataset.reportIndex||0));setReportState(row,row.dataset.state||"queued")});
  const meta=$("#otomailRunMeta");
  if(meta) updateOtomailMeta(meta.dataset.state||"ready",meta.dataset.fileName||"",Number(meta.dataset.reportIndex||0));
}
async function runOtomailFlow(){
  if(otomailRunning) return;
  otomailRunning=true;
  const rows=$$(".report-row"),progress=$("#mailPipelineProgress"),packet=$("#mailPacket");
  if(!rows.length||!progress||!packet){otomailRunning=false;return;}

  while(otomailRunning){
    otomailRunNo+=1;
    progress.style.width="0%";
    setPipelineStage(-1);
    packet.classList.remove("is-visible");
    renderOtomailWindow(0,false);
    updateOtomailMeta("running",otomailReports[0].fileName,0);

    for(let i=0;i<otomailReports.length;i+=1){
      const row=renderOtomailWindow(i,true);
      updateOtomailMeta("running",otomailReports[i].fileName,i);

      setReportState(row,"generating");setPipelineStage(0);setMailPacket(row,0,true);
      await sleep(500);
      setReportState(row,"validating");setPipelineStage(1);setMailPacket(row,1,true);
      await sleep(560);
      setReportState(row,"sending");setPipelineStage(2);setMailPacket(row,2,true);
      await sleep(620);
      setReportState(row,"sent");
      row.classList.remove("is-current");
      progress.style.width=`${((i+1)/otomailReports.length)*100}%`;
      await sleep(180);
      packet.classList.remove("is-visible");
    }

    setPipelineStage(3);
    updateOtomailMeta("complete");
    await sleep(2400);
  }
}

function formatClock(date=new Date()){
  return date.toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
}
function appendRobotLog(message,state){
  const log=$("#robotLog"),row=document.createElement("div");
  row.innerHTML=`<span>${formatClock()}</span><strong>${message}</strong><small>${state}</small>`;
  log.appendChild(row);
  row.animate([{opacity:0,transform:"translateX(18px)"},{opacity:1,transform:"translateX(0)"}],{duration:350,easing:"cubic-bezier(.22,1,.36,1)"});
}
async function runRobotFlow(){
  if(robotRunning) return;
  robotRunning=true;
  const lab=$(".automation-lab"),status=$("#robotStatus"),log=$("#robotLog");
  if(!lab||!status||!log){robotRunning=false;return;}

  while(robotRunning){
    status.dataset.state="running";
    status.textContent=flowText[lang].robotRunning;
    lab.classList.add("is-running");
    log.innerHTML="";

    const steps=lang==="tr"?[
      ["Robot kuyruğu başlatıldı","START"],["INTAÇ oturumu güvenli şekilde açıldı","OK"],["Toplu sorgu parametreleri gönderildi","RUN"],
      ["Belge görüntüsü ve İNTAÇ tarihi alındı","OK"],["OCR alanları doğrulandı","OK"],["Veri Aycube entegrasyonuna aktarıldı","DONE"]
    ]:[
      ["Robot queue started","START"],["INTAÇ session opened securely","OK"],["Bulk query parameters submitted","RUN"],
      ["Document image and INTAÇ date retrieved","OK"],["OCR fields validated","OK"],["Data transferred to Aycube integration","DONE"]
    ];

    for(const step of steps){appendRobotLog(step[0],step[1]);await sleep(430)}
    lab.classList.remove("is-running");
    status.dataset.state="complete";
    status.textContent=flowText[lang].robotComplete;
    await sleep(1400);
  }
}

const plateCodes=["06","16","34","35","41","42","54","67","81"];
const plateLetters="ABCDEFGHJKLMNPRSTUVYZ";
const usedPlates=new Set($$(".truck-row strong").map(node=>node.textContent.trim()));
const truckOperations=["vehicleImport","vehicleExport","spareParts","documentTransfer"];
let supalanTruckTimer=null;
function randomFrom(items){return items[Math.floor(Math.random()*items.length)]}
function randomLetters(length){let result="";for(let i=0;i<length;i+=1)result+=plateLetters[Math.floor(Math.random()*plateLetters.length)];return result}
function randomDigits(length){const min=10**(length-1),max=10**length-1;return String(Math.floor(min+Math.random()*(max-min+1)))}
function generateUniquePlate(){
  for(let attempt=0;attempt<250;attempt+=1){
    const code=randomFrom(plateCodes),pattern=Math.floor(Math.random()*3);
    const plate=pattern===0?`${code} ${randomLetters(3)} ${randomDigits(3)}`:pattern===1?`${code} ${randomLetters(2)} ${randomDigits(4)}`:`${code} ${randomLetters(1)} ${randomDigits(4)}`;
    if(!usedPlates.has(plate)){usedPlates.add(plate);return plate}
  }
  const fallback=`41 AY ${Date.now().toString().slice(-4)}`;usedPlates.add(fallback);return fallback;
}
function updateTruckRowLanguage(row){
  const operation=row.querySelector(".truck-operation"),status=row.querySelector(".truck-status");
  if(operation) operation.textContent=flowText[lang][row.dataset.operation]||row.dataset.operation;
  if(status) status.textContent=flowText[lang][row.dataset.status]||row.dataset.status;
}
function setTruckStatus(row,state){
  row.dataset.status=state;
  const status=row.querySelector(".truck-status");
  status.className=`truck-status status-${state}`;
  updateTruckRowLanguage(row);
}
function activeTruckValue(){return Number($("#truckCount").textContent)||0}
function waitingTruckValue(){return Number($("#waitingCount").textContent)||0}
function setMetric(id,value){$(id).textContent=String(Math.max(0,value)).padStart(2,"0")}
function showSupalanToast(title,text,type="success",icon="✓"){
  const toast=$("#reportToast");
  $("#reportToastTitle").textContent=title;$("#reportToastText").textContent=text;$("#reportToastIcon").textContent=icon;
  toast.classList.remove("is-visible","is-error","is-info");
  if(type==="error")toast.classList.add("is-error");else if(type==="info")toast.classList.add("is-info");
  void toast.offsetWidth;toast.classList.add("is-visible");
}
function trimTruckRows(maxRows=3){
  const rows=$$("#truckTableBody .truck-row");
  rows.slice(maxRows).forEach(row=>row.remove());
}
function addTruckEntry(){
  const body=$("#truckTableBody"),row=document.createElement("div"),plate=generateUniquePlate(),operation=randomFrom(truckOperations);
  if(!body)return;
  row.className="truck-row is-new is-transitioning";row.dataset.operation=operation;row.dataset.status="registered";
  row.innerHTML=`<span>${new Date().toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"})}</span><strong>${plate}</strong><span class="truck-operation"></span><small class="truck-status status-registered"></small>`;
  body.prepend(row);trimTruckRows(3);updateTruckRowLanguage(row);
  setMetric("#truckCount",activeTruckValue()+1);
  showSupalanToast(flowText[lang].truckAdded,`${plate} · ${flowText[lang][operation]}`,"info","+");

  setTimeout(()=>{
    if(!row.isConnected)return;
    row.classList.remove("is-transitioning");setTruckStatus(row,"waiting");setMetric("#waitingCount",waitingTruckValue()+1);
  },700);
  setTimeout(()=>{
    if(!row.isConnected||row.dataset.status!=="waiting")return;
    setMetric("#waitingCount",waitingTruckValue()-1);setTruckStatus(row,"processing");
  },3600);
  setTimeout(()=>{
    if(!row.isConnected||row.dataset.status==="complete")return;
    if(row.dataset.status==="waiting")setMetric("#waitingCount",waitingTruckValue()-1);
    setTruckStatus(row,"complete");setMetric("#truckCount",activeTruckValue()-1);
    setMetric("#completedCount",(Number($("#completedCount").textContent)||0)+1);trimTruckRows();
  },9000);
}
function startSupalanTruckFlow(){
  if(!$("#truckTableBody"))return;
  if(supalanTruckTimer)clearInterval(supalanTruckTimer);
  addTruckEntry();
  supalanTruckTimer=setInterval(addTruckEntry,10500);
}
function refreshDynamicLanguage(){
  refreshOtomailLanguage();
  $$(".truck-row").forEach(updateTruckRowLanguage);
  const robotStatus=$("#robotStatus");
  if(robotStatus){
    const state=robotStatus.dataset.state||"ready";
    robotStatus.textContent=state==="running"?flowText[lang].robotRunning:state==="complete"?flowText[lang].robotComplete:flowText[lang].robotReady;
  }
}

function updateLanguage(){
document.documentElement.lang=lang;$("#langBtn").textContent=lang.toUpperCase();
$$("[data-tr][data-en]").forEach(n=>n.textContent=n.dataset[lang]);sectionName.textContent=titleFor(current);buildOverview();
const p=$(".engine-node.is-active");if(p)renderPartnership(p.dataset.partnership,false);
const i=$(".integration-tab.is-active");if(i)renderIntegration(i.dataset.integrationTab);
setSupalanImage(supalanCurrent);refreshDynamicLanguage();
}

async function copyTeamEmail(button){
  const email=button.dataset.copyEmail;
  let copied=false;
  try{
    await navigator.clipboard.writeText(email);
    copied=true;
  }catch{
    const field=document.createElement("textarea");
    field.value=email;field.setAttribute("readonly","");field.style.position="fixed";field.style.opacity="0";
    document.body.appendChild(field);field.select();
    copied=document.execCommand("copy");field.remove();
  }
  const feedback=copied?(lang==="tr"?"Kopyalandı":"Copied"):(lang==="tr"?"Kopyalanamadı":"Copy failed");
  clearTimeout(button.copyFeedbackTimer);
  button.dataset.copyFeedback=feedback;
  button.textContent=copied?"✓":"!";
  button.classList.toggle("is-copied",copied);
  button.classList.toggle("is-copy-error",!copied);
  button.classList.add("show-copy-feedback");
  button.setAttribute("aria-label",feedback);
  button.copyFeedbackTimer=setTimeout(()=>{
    button.textContent="⧉";
    button.classList.remove("is-copied","is-copy-error","show-copy-feedback");
    button.setAttribute("aria-label",lang==="tr"?"E-posta adresini kopyala":"Copy email address");
  },1500);
}


const lightbox=$("#imageLightbox"),lightboxImage=$("#lightboxImage"),lightboxTitle=$("#lightboxTitle"),lightboxCounter=$("#lightboxCounter"),lightboxOpenFile=$("#lightboxOpenFile");
let lightboxItems=[],lightboxIndex=0,lightboxReturnFocus=null,reopenInfoModalAfterLightbox=false;

function normalizeLightboxItem(item){
  if(typeof item==="string") return {src:item,title:"Görsel"};
  return {src:item.src,title:item.title || item.alt || item.label?.[lang] || "Görsel"};
}
function openLightbox(items,index=0){
  lightboxItems=(Array.isArray(items)?items:[items]).map(normalizeLightboxItem).filter(x=>x.src);
  if(!lightboxItems.length || !lightbox) return;
  lightboxReturnFocus=document.activeElement;
  reopenInfoModalAfterLightbox=Boolean(infoModal?.open);
  if(reopenInfoModalAfterLightbox) infoModal.close();
  lightboxIndex=Math.max(0,Math.min(index,lightboxItems.length-1));
  renderLightbox();
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden","false");
  document.body.classList.add("has-open-lightbox");
  requestAnimationFrame(()=>$("#lightboxClose")?.focus());
}
function renderLightbox(){
  const item=lightboxItems[lightboxIndex];
  lightboxImage.classList.remove("is-loaded");
  lightboxImage.onload=()=>lightboxImage.classList.add("is-loaded");
  lightboxImage.onerror=()=>lightboxImage.classList.add("is-loaded");
  lightboxImage.src=item.src;
  lightboxImage.alt=item.title;
  lightboxTitle.textContent=item.title;
  lightboxCounter.textContent=`${lightboxIndex+1} / ${lightboxItems.length}`;
  lightboxOpenFile.href=item.src;
  $("#lightboxPrev").style.display=lightboxItems.length>1?"block":"none";
  $("#lightboxNext").style.display=lightboxItems.length>1?"block":"none";
  if(lightboxImage.complete) requestAnimationFrame(()=>lightboxImage.classList.add("is-loaded"));
}
function closeLightbox(){
  if(!lightbox) return;
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden","true");
  document.body.classList.remove("has-open-lightbox");
  const shouldReopenInfoModal=reopenInfoModalAfterLightbox;
  reopenInfoModalAfterLightbox=false;
  setTimeout(()=>{
    if(lightbox.classList.contains("is-open")) return;
    lightboxImage.src="";
    if(shouldReopenInfoModal && !infoModal.open) infoModal.showModal();
    lightboxReturnFocus?.focus?.();
  },240);
}
function moveLightbox(delta){
  if(!lightboxItems.length) return;
  lightboxIndex=(lightboxIndex+delta+lightboxItems.length)%lightboxItems.length;
  renderLightbox();
}
function galleryForProjectKey(key){
  return (projectScreens[key]||[]).map(x=>({src:x.src,title:x.label?.[lang]||"Aycube ekranı"}));
}
function galleryForSpecialKey(key){
  return (specialScreens[key]||[]).map(x=>({src:x.src,title:x.label?.[lang]||"Aycube ekranı"}));
}
function indexForSource(items,src){
  const index=items.findIndex(item=>item.src===src);
  return index>=0?index:0;
}
function galleryFromCards(selector,titleSelector="strong"){
  return $$(selector).map(card=>{
    const img=card.querySelector("img");
    return {src:img?.getAttribute("src"),title:card.querySelector(titleSelector)?.textContent?.trim()||img?.alt||"Görsel"};
  }).filter(item=>item.src);
}
function resolveImageOpenRequest(target){
  if(!(target instanceof Element)) return null;
  if(target.closest(".logo-stage,.aycube-lockup,.engine-center,.closing-logos")) return null;

  const projectMedia=target.closest(".project-card-media");
  if(projectMedia) return null;

  const specialVisual=target.closest(".screenshot-visual");
  if(specialVisual){
    const card=specialVisual.closest(".special-card"),img=specialVisual.querySelector("img");
    const gallery=galleryForSpecialKey(card?.dataset.special);
    const items=gallery.length?gallery:[{src:img?.getAttribute("src"),title:img?.alt||"Proje görseli"}];
    return {items,index:indexForSource(items,img?.getAttribute("src"))};
  }

  const aycubeCard=target.closest(".aycube-preview-card");
  if(aycubeCard){
    const items=galleryFromCards(".aycube-preview-card"),src=aycubeCard.querySelector("img")?.getAttribute("src");
    return {items,index:indexForSource(items,src)};
  }

  const supalanTarget=target.closest(".supalan-hero,.supalan-thumb");
  if(supalanTarget){
    const index=supalanTarget.matches(".supalan-thumb")?Number(supalanTarget.dataset.supalanIndex):supalanCurrent;
    return {items:supalanImages.map(item=>({src:item.src,title:item.caption[lang]})),index};
  }

  const supalanWebCard=target.closest(".supalan-web-card");
  if(supalanWebCard){
    return {items:supalanWebScreens.map(item=>({src:item.src,title:item.title[lang]})),index:0};
  }

  const teamPhoto=target.closest(".team-photo-wrap");
  if(teamPhoto){
    const items=$$(".team-photo-wrap").map(photo=>{
      const img=photo.querySelector("img"),card=photo.closest("[data-team-card]");
      return {src:img?.getAttribute("src"),title:card?.querySelector(".team-name")?.textContent?.trim()||img?.alt||"Ekip"};
    }).filter(item=>item.src);
    return {items,index:indexForSource(items,teamPhoto.querySelector("img")?.getAttribute("src"))};
  }

  const singleImageZone=target.closest(".robot-avatar");
  if(singleImageZone){
    const img=singleImageZone.querySelector("img");
    return {items:[{src:img?.getAttribute("src"),title:img?.alt||"Görsel"}],index:0};
  }

  const directImage=target.closest(".robot-avatar img,#deck img");
  if(!directImage || directImage.closest(".report-icon,.pipeline-packet")) return null;
  return {items:[{src:directImage.getAttribute("src"),title:directImage.alt||(lang==="tr"?"Sunum görseli":"Presentation image")}],index:0};
}
function bindImageOpeners(){
  const deck=$("#deck");
  if(!deck) return;
  const zoomZones=".screenshot-visual,.aycube-preview-card,.supalan-hero,.supalan-thumb,.supalan-web-card,.team-photo-wrap,.robot-avatar";
  $$(zoomZones).forEach(zone=>zone.setAttribute("data-zoom-ready","true"));
  deck.addEventListener("click",event=>{
    const request=resolveImageOpenRequest(event.target);
    if(!request?.items?.length) return;
    const supalanThumb=event.target.closest?.(".supalan-thumb");
    if(supalanThumb){
      setSupalanImage(Number(supalanThumb.dataset.supalanIndex));
      startSupalanAutoplay();
    }
    event.preventDefault();
    event.stopImmediatePropagation();
    openLightbox(request.items,request.index);
  },true);
}

if(lightbox){
  $("#lightboxClose").addEventListener("click",closeLightbox);
  $("#lightboxPrev").addEventListener("click",()=>moveLightbox(-1));
  $("#lightboxNext").addEventListener("click",()=>moveLightbox(1));
  lightbox.addEventListener("click",event=>{if(event.target===lightbox)closeLightbox()});
}

prevBtn.addEventListener("click",()=>navigate(current-1));nextBtn.addEventListener("click",()=>navigate(current+1));
$("#startBtn").addEventListener("click",()=>navigate(1));$("#restartBtn").addEventListener("click",()=>navigate(0));$("#homeBtn").addEventListener("click",()=>navigate(0));
$("#fullscreenBtn").addEventListener("click",()=>document.fullscreenElement?document.exitFullscreen?.():document.documentElement.requestFullscreen?.());
$("#langBtn").addEventListener("click",()=>{lang=lang==="tr"?"en":"tr";updateLanguage()});
$("#overviewBtn").addEventListener("click",()=>overview.classList.add("is-open"));$("#overviewClose").addEventListener("click",()=>overview.classList.remove("is-open"));
notesBtn?.addEventListener("click",()=>toggleSpeakerNotes());notesClose?.addEventListener("click",()=>toggleSpeakerNotes(false));
$$("[data-team-card]").forEach(card=>card.addEventListener("click",()=>{const open=!card.classList.contains("is-open");$$("[data-team-card]").forEach(x=>{x.classList.remove("is-open");x.setAttribute("aria-expanded","false")});if(open){card.classList.add("is-open");card.setAttribute("aria-expanded","true")}}));
$$(".engine-node").forEach(b=>b.addEventListener("click",()=>togglePartnership(b)));
$("#partnershipClose")?.addEventListener("click",closePartnership);
$$(".project-card").forEach(b=>b.addEventListener("click",()=>openProjectGroup(b.dataset.project)));
$("#allProjectsBtn").addEventListener("click",()=>openCatalog("FORD PROJECT CATALOG",lang==="tr"?"Ford Otosan Proje Kataloğu":"Ford Otosan Project Catalogue",lang==="tr"?"Kullanıcı tarafından paylaşılan 29 proje, operasyonel yetkinliklere göre gruplandırılmıştır.":"The 29 projects supplied by the user are grouped by operational capability.",projectCatalog[lang]));
$$(".integration-tab").forEach(b=>b.addEventListener("click",()=>{$$(".integration-tab").forEach(x=>x.classList.remove("is-active"));b.classList.add("is-active");renderIntegration(b.dataset.integrationTab)}));
$$(".special-card").forEach(b=>b.addEventListener("click",()=>openInfo(specialData[lang][b.dataset.special],specialScreens[b.dataset.special]||[])));
$$("[data-rpa-project]").forEach(b=>b.addEventListener("click",()=>{
  const key=b.dataset.rpaProject;
  openInfo(rpaProjectData[lang][key],rpaProjectScreens[key]||[]);
}));
$$("[data-supalan-feature]").forEach(b=>b.addEventListener("click",()=>openSupalanFeature(b.dataset.supalanFeature)));
$$("[data-copy-email]").forEach(button=>button.addEventListener("click",()=>copyTeamEmail(button)));
startSupalanAutoplay();
startSupalanTruckFlow();
runOtomailFlow();
runRobotFlow();

$("#allReportsBtn").addEventListener("click",()=>openCatalog("OTOMAIL REPORT CATALOG",lang==="tr"?"Ford Otomail Rapor Kataloğu":"Ford Otomail Report Catalogue",lang==="tr"?"37 rapor kaydı konu başlıklarına göre gruplanmıştır. Otomail akışında raporlar güvenli biçimde üretilir, doğrulanır ve yalnızca yetkili Ford Otosan alıcılarına iletilir.":"The 37 report entries are grouped by subject. In the Otomail flow, reports are securely generated, validated and delivered only to authorised Ford Otosan recipients.",reportCatalog[lang]));

$("#intacDetailBtn").addEventListener("click",()=>openInfo(lang==="tr"?["INTAÇ AUTOMATION","Ford INTAÇ Sorgulama","Robotun portal oturumu açması, sorgu parametrelerini girmesi, sonucu alması ve sonraki sisteme kontrollü biçimde aktarması.",["Tekrarlı portal adımlarının otomasyonu","Sorgu sonuçlarının loglanması","Hata ve istisna durumlarının işaretlenmesi","Aycube ve ilgili sistemlere aktarım"],"flow"]:["INTAÇ AUTOMATION","Ford INTAÇ Query","The robot opens the portal session, enters query parameters, retrieves the result and transfers it to the next system in a controlled flow.",["Automation of repetitive portal steps","Query-result logging","Error and exception marking","Transfer to Aycube and related systems"],"flow"],projectScreens.intac));

$("#modalClose").addEventListener("click",()=>infoModal.close());infoModal.addEventListener("click",e=>{if(e.target===infoModal)infoModal.close()});
$("#modalGallery")?.addEventListener("click",event=>{
  const detailToggle=event.target.closest(".screen-detail-toggle");
  if(detailToggle){
    const card=detailToggle.closest("figure"),isOpen=!card.classList.contains("is-detail-open");
    card.classList.toggle("is-detail-open",isOpen);
    detailToggle.setAttribute("aria-expanded",String(isOpen));
    detailToggle.querySelector("span").textContent=isOpen?(lang==="tr"?"Detayı kapat":"Close details"):(lang==="tr"?"Detayı aç":"Open details");
    return;
  }
  const preview=event.target.closest(".screen-preview");
  if(!preview) return;
  const figure=preview.closest("figure");
  const figures=$$("#modalGallery figure");
  const items=figures.map(fig=>({src:fig.querySelector("img")?.getAttribute("src"),title:fig.querySelector("figcaption strong")?.textContent?.trim() || fig.querySelector("img")?.alt || "Aycube ekranı"}));
  const idx=figures.indexOf(figure);
  openLightbox(items,idx>=0?idx:0);
});
$("#modalPoints")?.addEventListener("click",event=>{
  const toggle=event.target.closest(".project-detail-toggle");
  if(!toggle) return;
  const card=toggle.closest(".project-detail-card"),isOpen=!card.classList.contains("is-open");
  card.classList.toggle("is-open",isOpen);
  toggle.setAttribute("aria-expanded",String(isOpen));
});
document.addEventListener("keydown",e=>{
  if(lightbox?.classList.contains("is-open")){
    if(e.key==="Escape") closeLightbox();
    if(e.key==="ArrowLeft") moveLightbox(-1);
    if(e.key==="ArrowRight") moveLightbox(1);
    if(["Escape","ArrowLeft","ArrowRight"].includes(e.key)) e.preventDefault();
    return;
  }
  if(infoModal.open)return;
  if(["ArrowRight","PageDown"," "].includes(e.key)){e.preventDefault();navigate(current+1)}
  if(["ArrowLeft","PageUp"].includes(e.key)){e.preventDefault();navigate(current-1)}
  if(e.key.toLowerCase()==="f")document.fullscreenElement?document.exitFullscreen?.():document.documentElement.requestFullscreen?.();
  if(e.key.toLowerCase()==="o")overview.classList.add("is-open");
  if(e.key.toLowerCase()==="n")toggleSpeakerNotes();
  if(e.key==="Home")navigate(0);
  if(e.key==="End")navigate(slides.length-1);
  if(e.key==="Escape")overview.classList.remove("is-open");
});
document.addEventListener("touchstart",e=>touchStartX=e.changedTouches[0].screenX,{passive:true});
document.addEventListener("touchend",e=>{
  if(touchStartX===null)return;
  const d=e.changedTouches[0].screenX-touchStartX;
  touchStartX=null;
  if(Math.abs(d)<=60)return;
  if(lightbox?.classList.contains("is-open")){moveLightbox(d<0?1:-1);return}
  if(infoModal.open)return;
  d<0?navigate(current+1):navigate(current-1);
},{passive:true});
document.addEventListener("mousemove",e=>{$("#cursorAura").style.left=`${e.clientX}px`;$("#cursorAura").style.top=`${e.clientY}px`});
bindImageOpeners();
$("#robotStatus").dataset.state="ready";
$$(".report-row").forEach(row=>setReportState(row,row.dataset.state||"queued"));
$$(".truck-row").forEach(updateTruckRowLanguage);
const requestedSlide=Number(new URLSearchParams(location.search).get("slide")||1)-1;
buildOverview();commitSlide(Number.isFinite(requestedSlide)?requestedSlide:0);updateLanguage();scheduleAdjacentWarmup(current);
