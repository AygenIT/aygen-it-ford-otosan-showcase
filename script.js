const slides=[...document.querySelectorAll(".slide")];
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const prevBtn=$("#prevBtn"),nextBtn=$("#nextBtn"),progressBar=$("#progressBar"),currentNo=$("#currentNo"),totalNo=$("#totalNo"),sectionName=$("#sectionName");
const transitionStage=$("#transitionStage"),transitionNumber=$("#transitionNumber"),transitionName=$("#transitionName");
const overview=$("#overview"),overviewGrid=$("#overviewGrid"),infoModal=$("#infoModal"),notesPanel=$("#speakerNotes"),notesBtn=$("#notesBtn"),notesClose=$("#notesClose"),notesTitle=$("#speakerNotesTitle"),notesText=$("#speakerNotesText");
const projectSolutionModal=$("#projectSolutionModal");
const solutionModals={integration:$("#integrationSolutionModal"),automation:$("#rpaSolutionModal"),customs:projectSolutionModal,finance:projectSolutionModal,archive:projectSolutionModal,romania:$("#romaniaModal")};
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

// Hidden slides and dialog content can cause native lazy-loading to start too
// late in presentation mode. Warm the active and upcoming slide assets with a
// small rolling window so images are ready without downloading the full deck
// in one burst.
const warmedAssetSources=new Set(cinematicAssetSources);
function warmImageSource(src){
  if(!src||warmedAssetSources.has(src))return;
  warmedAssetSources.add(src);
  const image=new Image();
  image.decoding="async";
  image.src=src;
  if(typeof image.decode==="function")image.decode().catch(()=>undefined);
}
function warmSlideAssets(index){
  if(index<0||index>=slides.length)return;
  slides[index].querySelectorAll("img").forEach(image=>{
    const src=image.currentSrc||image.getAttribute("src");
    if(!src)return;
    image.loading="eager";
    warmImageSource(src);
  });
}

const partnershipData={
tr:{
collaboration:["01 / YAKIN ÇALIŞMA","Ford ekipleriyle ortak çalışma masası","İhtiyaçlar Ford operasyon ekipleriyle doğrudan ele alınır; hedef, kapsam ve öncelikler birlikte netleştirilir."],
analysis:["02 / ANALİZ","İhtiyacı veriye ve akışa dönüştürme","Mevcut süreç, veri kaynakları, iş kuralları ve istisnalar birlikte analiz edilir; ölçülebilir kabul kriterleri oluşturulur."],
development:["03 / GELİŞTİRME","Onaylı kapsamı çalışan çözüme dönüştürme","Çözüm, Ford süreçlerine uyumlu modüler bileşenlerle geliştirilir; entegrasyonlar ve kritik senaryolar uçtan uca doğrulanır."],
architecture:["04 / GÜVENLİ MİMARİ","Güvenli ve sürdürülebilir temel","Yetkilendirme, veri bütünlüğü, izlenebilir kayıt ve genişleyebilir entegrasyon yapısı Ford’un güvenlik gereksinimleriyle birlikte ele alınır."],
iteration:["05 / HIZLI İTERASYON","Geri bildirimle kısa geliştirme döngüsü","Demo ve kullanıcı testlerinden gelen geri bildirimler hızla değerlendirilir; küçük, kontrollü sürümlerle çözüm sürekli iyileştirilir."],
delivery:["06 / PROJE TESLİMİ","Kontrollü geçiş, kalıcı kullanım","Kabul testleri tamamlanan çözüm dokümantasyon, kullanıcı bilgilendirmesi ve destek planıyla devreye alınır; sonuçlar birlikte izlenir."]},
en:{
collaboration:["01 / CLOSE COLLABORATION","A shared working table with Ford teams","Needs are addressed directly with Ford operations teams, while goals, scope and priorities are clarified together."],
analysis:["02 / ANALYSIS","Turning needs into data and process flows","The current process, data sources, business rules and exceptions are analysed together to define measurable acceptance criteria."],
development:["03 / DEVELOPMENT","Turning approved scope into a working solution","The solution is developed with modular components aligned to Ford processes, while integrations and critical scenarios are validated end to end."],
architecture:["04 / SECURE ARCHITECTURE","A secure and sustainable foundation","Authorisation, data integrity, traceable records and an extensible integration structure are addressed together with Ford’s security requirements."],
iteration:["05 / FAST ITERATION","Short development cycles shaped by feedback","Feedback from demos and user tests is evaluated quickly, continuously improving the solution through small, controlled releases."],
delivery:["06 / PROJECT DELIVERY","Controlled rollout, lasting adoption","After acceptance testing, the solution goes live with documentation, user guidance and a support plan, and outcomes are monitored together."]}};
const partnershipKeys=["collaboration","analysis","development","architecture","iteration","delivery"];

const projectData={
tr:{
customs:["CUSTOMS & TRACKING","Gümrük ve Takip Projeleri","Ford operasyonlarında beyan, evrak, süre ve geçici rejim risklerini 12 ayrı proje üzerinden tek platformda kontrol altına alan yönetim katmanı.",["Geçici İthalat Takip","İthalat Beyanname Raporu Detaylı","İthalat Beyanname Raporu","İhracat Beyanname Raporu","İhracat Beyanname Raporu Detaylı","Beyanname Durum Bilgisi","Beyanname Tescil Kontrolü","Yedek Parça Dekont ve Beyanname Görüntüsü","Bankaya Gönderilen Beyanname Görüntüsü","Ford'a Özel Aycube BI'lar — 14 özel BI","Kapı Bildirimleri","Beyanname Durum Bilgileri"],"flow"],
integration:["INTEGRATION & DATA","Entegrasyon ve Veri Projeleri","Kaynak sistem verisini Ford operasyon kurallarıyla birleştirip manuel girişleri azaltan, veri kalitesini yükselten entegrasyon omurgası.",["Ford Vergi","Ford İthalat","Ford Araç","Ford Araç İhracat","Ford İntaç Entegrasyon","Ford Kamyon İhracat","Ford Parça İhracat","Ford Arşiv Entegrasyon","GetApp Entegrasyon","TPS Entegrasyon"],"flow"],
automation:["RPA & OCR","RPA ve OCR Projeleri","Tekrarlı portal ve belge işlerini robotlaştırarak operasyon ekiplerine hız, standart ve hata kontrolü kazandıran otomasyon katmanı.",["Tareks","tareks işlemlerinin rpa üzerinde yapılması","Ford Fatura OCR","Ford Faturalarında 0910 Tekrarlanmasının Önlenmesi","Otomatik Fatura Ekranına Ford Firmalarının Dosyalarının Gelmesi"],"flow"],
finance:["FINANCE & COMMISSION","Finans ve Komisyon Projeleri","Vergi, faturalama, beyanname görüntüsü ve ekstre gönderiminde finansal görünürlük ile denetlenebilir kontrol sağlayan dört proje.",["Bankaya Gönderilen Beyanname Görüntüsü","Toplu Fatura","Vergi Talep","Ekstre Gönderiminin Otomatize Edilmesi"],"flow"],
archive:["ARCHIVE & DOCUMENT","Arşiv ve Doküman Projeleri","Ford evrak hafızasını standartlaştıran, arama süresini kısaltan ve denetim gücünü artıran doküman omurgası.",["Arşiv Fihrist","Arşiv Doküman Yönetim Sistemi","Toplu Evrak Talep"],"search"]},
en:{
customs:["CUSTOMS & TRACKING","Customs and Tracking Projects","An executive control layer managing declaration, document, deadline and temporary-regime risks across Ford operations through 12 distinct projects.",["Temporary Import Tracking","Detailed Import Declaration Report","Import Declaration Report","Export Declaration Report","Detailed Export Declaration Report","Declaration Status Information","Declaration Registration Check","Spare-Part Receipt and Declaration Image","Declaration Image Sent to the Bank","Ford-Specific Aycube BI Dashboards — 14 custom BI dashboards","Gate Notifications","Declaration Status Details"],"flow"],
integration:["INTEGRATION & DATA","Integration and Data Projects","An integration backbone that combines source-system data with Ford-specific rules, reducing manual entry and improving data quality.",["Ford Integration","Bulk INTAÇ Query with date integration","Bulk INTAÇ date query","GTIP Update","Automatically populated export fields","Automatic post-registration tax-field entry","Accounting Office Information"],"flow"],
automation:["RPA & OCR","RPA and OCR Projects","An automation layer that robotizes repetitive portal and document tasks, giving teams speed, standards and error control.",["TAREKS","TAREKS operations through RPA","Ford Invoice OCR","Prevention of repeated 0910 on Ford invoices","Automatic arrival of Ford company files on the invoice screen"],"flow"],
finance:["FINANCE & COMMISSION","Finance and Commission Projects","Four projects providing financial visibility and auditable control across tax requests, billing, declaration images and statement delivery.",["Declaration Image Sent to the Bank","Bulk Billing","Tax Request","Automated Statement Delivery"],"flow"],
archive:["ARCHIVE & DOCUMENT","Archive and Document Projects","A document backbone that standardizes Ford’s document memory, reduces search time and strengthens audit readiness.",["Archive Index","Archive Document Management System","Bulk Document Request"],"search"]}};

const projectItems={
customs:[
  {title:{tr:"Geçici İthalat Takip",en:"Temporary Import Tracking"},image:"assets/aycube_screens/gecici-ithalat-takip.png",description:{tr:"Geçici ithalat dosyalarının giriş, kapanış ve süre bilgilerini tek ekranda izler. Yaklaşan terminleri, açık kalan kayıtları ve aksiyon bekleyen işlemleri Ford ekipleri için görünür hâle getirir.",en:"Tracks entry, closure and deadline information for temporary import files on one screen, highlighting approaching deadlines, open records and actions awaiting Ford teams."}},
  {title:{tr:"İthalat Beyanname Raporu Detaylı",en:"Detailed Import Declaration Report"},image:"assets/aycube_screens/ithalat-beyanname-raporu-detayli.png",description:{tr:"Ford ithalat beyannamelerini kalem, rejim, gümrük, ülke, vergi, kıymet ve belge bilgileriyle ayrıntılı biçimde sunar. Filtrelenebilir yapı sayesinde aranan kayıt hızlıca bulunur ve operasyonel kontrol kolaylaşır.",en:"Presents Ford import declarations in detail across item, regime, customs office, country, tax, value and document data. Its filterable structure makes records easy to find and control."}},
  {title:{tr:"İthalat Beyanname Raporu",en:"Import Declaration Report"},image:"assets/aycube_screens/ithalat-beyanname-raporu.png",description:{tr:"İthalat dosyalarını beyanname numarası, tarih, rejim, gümrük ve durum bilgileriyle tek raporda toplar. Güncel operasyon tablosu sayesinde bekleyen ve tamamlanan işlemler karşılaştırılabilir.",en:"Collects import files in one report with declaration number, date, regime, customs office and status data, making pending and completed operations easy to compare."}},
  {title:{tr:"İhracat Beyanname Raporu",en:"Export Declaration Report"},image:"assets/aycube_screens/ihracat-beyanname-raporu.png",description:{tr:"İhracat beyannamelerini sevkiyat, çıkış, ülke ve kapanış bilgileriyle tek görünümde izler. Ford ekipleri dosya durumunu ve sonuç bilgisini aynı ekran üzerinden takip eder.",en:"Tracks export declarations in one view with shipment, exit, country and closure information, allowing Ford teams to follow file status and results from the same screen."}},
  {title:{tr:"İhracat Beyanname Raporu Detaylı",en:"Detailed Export Declaration Report"},image:"assets/aycube_screens/ihracat-beyanname-raporu-detayli.png",description:{tr:"Ford ihracat beyannamelerini dosya, firma, rejim, gümrük, ülke, ödeme, fatura ve kur bilgileriyle satır bazında ayrıntılı gösterir. Tarih, referans, firma, rejim, gümrük ve ticaret ülkesi filtreleriyle aranan kayıt hızla bulunur; sonuçlar XLSX veya CSV olarak dışa aktarılabilir.",en:"Displays Ford export declarations at line level with file, company, regime, customs office, country, payment, invoice and exchange-rate data. Date and operational filters locate records quickly, and results can be exported as XLSX or CSV."}},
  {title:{tr:"Beyanname Durum Bilgisi",en:"Declaration Status Information"},description:{tr:"Beyannamenin hazırlık, tescil, muayene, çıkış ve kapanış/intaç durumunu tek kayıtta gösterir. Bekleyen, hata alan veya aksiyon gerektiren dosyaları görünür kılar; ekiplerin güncel duruma göre hızlı aksiyon almasını sağlar.",en:"Shows preparation, registration, inspection, exit and closure status in one record. It highlights pending, failed and action-required files so teams can respond to the latest status quickly."}},
  {title:{tr:"Beyanname Tescil Kontrolü",en:"Declaration Registration Check"},description:{tr:"Beyanname tescilinden önce zorunlu alanları ve Ford operasyon kurallarını kontrol eder; eksik veya tutarsız kayıtları işlem tamamlanmadan görünür kılar.",en:"Checks mandatory fields and Ford operational rules before declaration registration, exposing missing or inconsistent records before the transaction is completed."}},
  {title:{tr:"Yedek Parça Dekont ve Beyanname Görüntüsü",en:"Spare-Part Receipt and Declaration Image"},description:{tr:"Yedek parça dosyalarındaki dekontları beyanname görüntüleriyle eşleştirir; belgeye tek noktadan ve izlenebilir biçimde erişim sağlar.",en:"Matches receipts in spare-part files with declaration images, providing traceable access to the document from a single point."}},
  {title:{tr:"Bankaya Gönderilen Beyanname Görüntüsü",en:"Declaration Image Sent to the Bank"},description:{tr:"Tescilli beyanname görüntüsünü kontrollü şekilde alır, yetkili banka akışına iletir ve gönderim sonucunu kayıt altına alır.",en:"Retrieves the registered declaration image in a controlled flow, sends it to the authorised bank channel and records the delivery result."}},
  {title:{tr:"Ford’a Özel Aycube BI’lar",en:"Ford-Specific Aycube BI Dashboards"},metric:{tr:"14 özel BI",en:"14 custom BI dashboards"},description:{tr:"Ford operasyonlarına özel hazırlanan 14 Aycube BI; ithalat, ihracat, gümrük, finans ve performans göstergelerini KPI, durum ve istisna görünümlerinde bir araya getirir.",en:"Fourteen Aycube BI dashboards built specifically for Ford bring import, export, customs, finance and performance indicators together in KPI, status and exception views."}},
  {title:{tr:"Kapı Bildirimleri",en:"Gate Notifications"},description:{tr:"Yedek parça dosyaları için Ford nakliye ve malzeme kabul ekiplerine zamanında bilgi gönderir; kapı ve teslim hareketlerini izlenebilir hâle getirir.",en:"Sends timely information to Ford transport and material-acceptance teams for spare-part files, making gate and delivery movements traceable."}},
  {title:{tr:"Beyanname Durum Bilgileri",en:"Declaration Status Details"},description:{tr:"Ford’a ait birden fazla beyannamenin tescil, muayene, çıkış, kapanış/intaç ve hata durumlarını toplu görünümde sunar. Filtrelerle bekleyen veya aksiyon gerektiren dosyaları öne çıkararak ekiplerin güncel duruma göre hızlı hareket etmesini sağlar.",en:"Presents the registration, inspection, exit, closure and error status of multiple Ford declarations in one consolidated view. Filters highlight pending or action-required files so teams can respond to current conditions quickly."}}
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
finance:[
  {title:{tr:"Bankaya Gönderilen Beyanname Görüntüsü",en:"Declaration Image Sent to the Bank"},description:{tr:"Tescilli beyanname görüntüsünü ilgili işlem kaydından kontrollü biçimde alır, yetkili banka kanalına iletir ve gönderim zamanı, alıcı ile sonuç bilgisini kayıt altında tutar.",en:"Retrieves the registered declaration image from the related transaction, delivers it through the authorised bank channel and records the delivery time, recipient and result."}},
  {title:{tr:"Toplu Fatura",en:"Bulk Billing"},description:{tr:"Dönem boyunca oluşan masraf ve fatura kalemlerini cari kod bazında bir araya getirir, gerekli kontrolleri uygular ve Ford için toplu faturalama sürecini standart bir akışta tamamlar.",en:"Consolidates expense and invoice items accumulated during the period by account code, applies the required controls and completes Ford's bulk-billing process through a standard flow."}},
  {title:{tr:"Vergi Talep",en:"Tax Request"},description:{tr:"Dosya ve beyanname bazlı vergi taleplerini gerekli tutar, referans ve onay bilgileriyle oluşturur; talebin bekleyen, onaylanan ve tamamlanan adımlarını izlenebilir hâle getirir.",en:"Creates file- and declaration-based tax requests with the required amount, reference and approval data, making pending, approved and completed steps traceable."}},
  {title:{tr:"Ekstre Gönderiminin Otomatize Edilmesi",en:"Automated Statement Delivery"},description:{tr:"Ford için hazırlanan ekstreleri belirlenen periyot ve alıcı kurallarına göre otomatik oluşturur, doğrular ve yetkili ekiplere iletir. Gönderim sonucu ile hata durumlarını kayıt altında tutar.",en:"Automatically prepares and validates Ford statements according to schedule and recipient rules, then delivers them to authorised teams while recording delivery results and errors."}}
],
archive:[
  {title:{tr:"Arşiv Fihrist",en:"Archive Index"},image:"assets/aycube_screens/arsiv-fihrist.png",description:{tr:"Beyanname ve ek belgelerin Ford arşivindeki konumunu indeksler. Dosya numarası, beyanname veya referans üzerinden hızlı ve denetlenebilir belge erişimi sağlar.",en:"Indexes the location of declarations and supporting documents in the Ford archive, enabling fast and auditable access by file number, declaration or reference."}},
  {title:{tr:"Arşiv Doküman Yönetim Sistemi",en:"Archive Document Management System"},image:"assets/aycube_screens/arsiv-dosya-yukleme.png",description:{tr:"Belgeleri doğru dosya ve işlem kaydıyla ilişkilendirerek standart isim ve referans bilgileriyle arşive aktarır. Dokümanların merkezi, düzenli ve izlenebilir biçimde yönetilmesini sağlar; eksik veya hatalı kayıt riskini azaltır.",en:"Links documents to the correct file and transaction record, then archives them with standard names and references. It provides central, orderly and traceable document management while reducing missing or incorrect records."}},
  {title:{tr:"Toplu Evrak Talep",en:"Bulk Document Request"},description:{tr:"Birden fazla dosya için evrak taleplerini tek işlemde Beyanname No. ya da Dosya No. ile Aycube üzerinden oluşturur, durumlarını izler ve tamamlanan belgeleri ilgili kayda bağlar.",en:"Creates document requests for multiple files in one operation, tracks their status and links completed documents to the relevant record."}}
]};

const projectBenefits={
tr:{
customs:[
  ["Termin kaçırma riski azalır","Açık dosyalara daha hızlı aksiyon alınır","Manuel takip süresi kısalır"],
  ["Kontrol süresi kısalır","Eksik ve uyumsuz kayıtlar daha erken görülür","Karar için tek ekranda güvenilir veri sağlanır"],
  ["İthalat görünürlüğü artar","Manuel rapor hazırlama yükü azalır","Operasyon öncelikleri daha hızlı belirlenir"],
  ["İhracat hareketleri daha hızlı izlenir","Gecikme ve eksik kayıt riski azalır","Ekipler ortak ve güncel veriyle çalışır"],
  ["Detay kontrol süresi kısalır","Hatalı alanlar erken fark edilir","Tescil ve çıkış takibi hızlanır"],
  ["Dosya durumu anlık görünür","Sorgulama için harcanan süre azalır","Bekleyen işlemler hızla önceliklendirilir"],
  ["Tescil hataları erken yakalanır","Tekrar işlem ve düzeltme maliyeti azalır","Operasyon güvenilirliği artar"],
  ["Belgeye erişim süresi kısalır","Eksik evrak arama yükü azalır","Finans ve operasyon kontrolü hızlanır"],
  ["Manuel e-posta işlemleri azalır","Gönderim takibi izlenebilir hâle gelir","Ödeme sürecindeki gecikme riski düşer"],
  ["Karar verisine daha hızlı ulaşılır","Manuel raporlama yükü azalır","Performans ve istisnalar görünür olur"],
  ["Kapı hareketleri izlenebilir hâle gelir","Gümrük süreci takibi hızlanır","Kayıt kaynaklı belirsizlik azalır"],
  ["Çoklu dosya durumu tek ekranda izlenir","Bekleyen işlemler hızla önceliklendirilir","Manuel sorgu ve kontrol süresi azalır"]
],
finance:[
  ["Manuel e-posta ve ek yönetimi azalır","Banka gönderimleri izlenebilir hâle gelir","Ödeme sürecindeki gecikme riski düşer"],
  ["Faturalama süresi kısalır","Tekrarlı kontrol ve işlem yükü azalır","Finansal kayıt tutarlılığı artar"],
  ["Vergi talep süreci standartlaşır","Onay ve ödeme durumu görünür olur","Eksik bilgi kaynaklı gecikmeler azalır"],
  ["Manuel ekstre hazırlama yükü azalır","Zamanında ve kontrollü gönderim sağlanır","Hata ve teslim kayıtları izlenebilir olur"]
],
archive:[
  ["Belge bulma süresi saniyelere iner","Operasyon beklemeleri azalır","Denetim hazırlığı kolaylaşır"],
  ["Dosyalama standardı güçlenir","Kayıp ve mükerrer belge riski azalır","Yetkili erişim ve izlenebilirlik artar"],
  ["Tekrarlı evrak talepleri azalır","Toplu işlemle zaman tasarrufu sağlanır","Talep durumu daha kolay takip edilir"]
]},
en:{
customs:[
  ["Deadline risk is reduced","Open files receive faster action","Manual tracking time is shortened"],
  ["Control time is shortened","Missing and inconsistent records surface earlier","Reliable decision data is available on one screen"],
  ["Import visibility increases","Manual reporting work decreases","Operational priorities are set faster"],
  ["Export movements are tracked faster","Delay and missing-record risk decreases","Teams work with shared, current data"],
  ["Detailed review time is shortened","Incorrect fields are identified early","Registration and exit tracking accelerates"],
  ["File status is instantly visible","Time spent on queries decreases","Pending work is prioritised faster"],
  ["Registration errors are caught early","Rework and correction costs decrease","Operational reliability increases"],
  ["Document access time is shortened","Missing-document search work decreases","Finance and operations checks accelerate"],
  ["Manual email work decreases","Delivery tracking becomes traceable","Payment delay risk decreases"],
  ["Decision data is reached faster","Manual reporting work decreases","Performance and exceptions become visible"],
  ["Gate movements become traceable","Customs-process tracking accelerates","Record-related uncertainty decreases"],
  ["Multiple file statuses are tracked on one screen","Pending work is prioritised faster","Manual query and review time decreases"]
],
finance:[
  ["Manual email and attachment work decreases","Bank deliveries become traceable","Payment-delay risk decreases"],
  ["Billing time is shortened","Repeated review and processing work decreases","Financial-record consistency increases"],
  ["The tax-request process becomes standard","Approval and payment status becomes visible","Delays caused by missing data decrease"],
  ["Manual statement preparation decreases","Timely and controlled delivery is provided","Errors and delivery records become traceable"]
],
archive:[
  ["Documents are found within seconds","Operational waiting time decreases","Audit preparation becomes easier"],
  ["Filing standards become stronger","Missing and duplicate document risk decreases","Authorised access and traceability increase"],
  ["Repeated document requests decrease","Bulk processing saves time","Request status is easier to follow"]
]}};

const integrationBenefits={
tr:{
import:[["Manuel veri girişi azalır","Beyanname hazırlığı hızlanır","Alan doğruluğu artar"],["Kalem bazlı kontrol süresi kısalır","GTİP ve alan hataları azalır","Tekrar işleme maliyeti düşer"]],
archive:[["Belge arama süresi kısalır","Operasyon beklemeleri azalır","Beyannameye ait diğer evrakların arşiv kayıtlarına erişim"],["Kullanıcı yetkilendirmesi ve işlem loglarıyla güvenli, izlenebilir arşiv erişimi sağlanır","Kontrol maliyeti düşer"]],
bank:[["Yanlış beyannameye ödeme ihtimali ortadan kalkar.","Vergi ödeme kayıtları gerçek zamanlı olarak işlenir ve raporlanır.","Manuel işlem kaynaklı hata riski azalır."]],
gtb:[["Başvuru ve belge takibi tek noktada birleşir","Manuel kontrol ve tekrar işlem yükü azalır","İzin, süre ve işlem durumları görünür hâle gelir","Ford ekipleri güncel kayıtlarla ilerler"],["IMEI başvurularında riskleri minimize eder.","Hatalı veya eksik işlem kaynaklı ceza riskini azaltır."]],
getApp:[["Beyanname bilgilerine erişim hızlanır","Tekrarlı veri girişi ve manuel sorgular azalır","Ekipler aynı güncel veriyle çalışır"],["Vergi tutarları ve ödeme kayıtları karşılaştırılabilir","Hatalı veya eksik ödeme riski azalır","Finansal kontrol ve mutabakat süresi kısalır"]]
},
en:{
import:[["Manual data entry decreases","Declaration preparation accelerates","Field accuracy increases"],["Line-level review time is shortened","GTIP and field errors decrease","Rework cost is reduced"]],
archive:[["Document search time is shortened","Operational waiting decreases","Access to archive records for other documents associated with the declaration"],["User authorisation and transaction logs provide secure, traceable access to the archive","Control cost is reduced"]],
bank:[["Eliminates the possibility of payment against the wrong declaration.","Tax payment records are processed and reported in real time.","Reduces the risk of errors caused by manual processing."]],
gtb:[["Application and document tracking are brought together","Manual checks and rework decrease","Permit, deadline and transaction status become visible","Ford teams work with current records"],["Minimises risks in IMEI applications.","Reduces the risk of penalties caused by incorrect or incomplete transactions."]],
getApp:[["Access to declaration information accelerates","Repeated data entry and manual queries decrease","Teams work with the same current data"],["Tax amounts and payment records can be compared","Incorrect or incomplete payment risk decreases","Financial control and reconciliation time is shortened"]]
}};

const integrationExportBenefits={
tr:["Sevkiyat ve beyanname hazırlığı hızlanır","Manuel veri girişi ve kontrol yükü azalır","Eksik alanlar ve veri tutarsızlıkları erken görülür","Vergi ve belge kontrolleri standartlaşır","İntaç bilgileri tek yönlü aktarılır; tescil ve çıkış kayıtlarıyla birlikte izlenir","Açık dosyalar ve gecikme riski görünür hâle gelir","Tekrar işlemden doğan zaman ve maliyet kaybı azalır"],
en:["Shipment and declaration preparation accelerates","Manual data entry and review workload decrease","Missing fields and inconsistent data are identified early","Tax and document checks are standardised","Closure information is transferred one way and tracked alongside registration and exit records","Open files and delay risks become visible","Time and cost lost to rework decrease"]
};

const rpaProjectBenefits={
tr:{
berkbot:["Tekrarlı iş yükü azalır","Kullanıcı hataları düşer","Operasyon kapasitesi artar"],
fordBilling:["Ay sonu faturalama süresi kısalır","Eksik ve tutarsız kayıtlar azalır","Muhasebe kontrol maliyeti düşer"],
invoiceOcr:["Manuel dosyalama ortadan kalkar","Belge ayrıştırma süresi kısalır","Fatura karışıklığı azalır"],
taxPayment:["Vergi ödeme süresi kısalır","Manuel işlem kaynaklı hata riski azalır","Ödeme sonuçları ve işlem kayıtları izlenebilir"],
intac:["Toplu sorgu süresi kısalır","Tekrarlı portal işlemleri azalır","Sonuç aktarımında hata riski düşer"]
},
en:{
berkbot:["Repetitive workload decreases","User errors decline","Operational capacity increases"],
fordBilling:["Month-end billing time is shortened","Missing and inconsistent records decrease","Accounting control cost is reduced"],
invoiceOcr:["Manual filing is eliminated","Document separation time is shortened","Invoice mix-ups decrease"],
taxPayment:["Tax payment processing time is shortened","The risk of manual processing errors decreases","Payment results and transaction records become traceable"],
intac:["Bulk query time is shortened","Repeated portal work decreases","Result-transfer error risk decreases"]
}};

const projectScreens={
  customs:[
    {src:"assets/aycube_screens/gecici-ithalat-takip.png",label:{tr:"Geçici İthalat Takip",en:"Temporary Import Tracking"}},
    {src:"assets/aycube_screens/ithalat-beyanname-raporu-detayli.png",label:{tr:"İthalat Beyanname Raporu Detaylı",en:"Detailed Import Declaration Report"}},
    {src:"assets/aycube_screens/ithalat-beyanname-raporu.png",label:{tr:"İthalat Beyanname Raporu",en:"Import Declaration Report"}},
    {src:"assets/aycube_screens/ihracat-beyanname-raporu.png",label:{tr:"İhracat Beyanname Raporu",en:"Export Declaration Report"}},
    {src:"assets/aycube_screens/ihracat-beyanname-raporu-detayli.png",label:{tr:"İhracat Beyanname Raporu Detaylı",en:"Detailed Export Declaration Report"}}
  ],
  integration:[
    {src:"assets/aycube_screens/ithalat-beyanname-raporu.png",label:{tr:"İthalat Beyanname Raporu",en:"Import Declaration Report"}},
    {src:"assets/aycube_screens/ihracat-beyanname-raporu.png",label:{tr:"İhracat Beyanname Raporu",en:"Export Declaration Report"}},
    {src:"assets/aycube_screens/bi-gtip-analiz.png",label:{tr:"GTİP Analiz Ekranı",en:"GTIP Analysis Screen"}},
    {src:"assets/aycube_screens/bi-ihracat-ithalat-grafik.png",label:{tr:"İhracat / İthalat Grafik Ekranı",en:"Export / Import Dashboard"}}
  ],
  automation:[
    {src:"assets/aycube_screens/arsiv-dosya-yukleme.png",label:{tr:"Arşiv Doküman Yönetim Sistemi",en:"Archive Document Management System"}},
    {src:"assets/aycube_screens/aycube-ana-ekran.png",label:{tr:"Aycube Ana Ekran",en:"Aycube Home Screen"}},
    {src:"assets/aycube_screens/gecici-ithalat-takip.png",label:{tr:"Takip Akışı",en:"Tracking Flow"}}
  ],
  finance:[],
  archive:[],
  intac:[]
};

const projectScreenDetails={
  "assets/aycube_screens/gecici-ithalat-takip.png":{
    tr:"Geçici ithalat dosyalarının giriş, kapanış ve süre bilgilerini tek ekranda izler. Yaklaşan terminleri, açık kalan kayıtları ve aksiyon bekleyen işlemleri Ford ekipleri için görünür hâle getirir.",
    en:"Tracks entry, closure and deadline information for temporary import files on one screen. It makes approaching deadlines, open records and actions awaiting attention visible to Ford teams."
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
import:{title:"İthalat Entegrasyonu",description:"Ford’un araç ithalatı ve genel ithalat işlemleri; operasyona özgü veri alanları, saymanlık bilgisi ve kontrol kurallarıyla ayrı akışlarda yönetilir.",rate:96.4,rateText:"%96,4",cards:[["1","İthalat Araç","Araç operasyonuna özel veri modeli, doğrulama alanları, saymanlık bilgisi ve beyanname senaryoları."],["2","İthalat","İthalat dosyalarına ait kalem, GTİP, kıymet, vergi ve belge bilgileri kaynak sistemden alınarak beyanname kayıtlarıyla eşleştirilir. Alan seçimi ve zorunlu bilgi kontrolleriyle verilerin güncel ve tutarlı aktarılması sağlanır."]]},
export:{title:"İhracat Entegrasyonu",description:"Araç, yedek parça ve kamyon ihracatından intaç takibine kadar sevkiyat, beyanname ve kapanış bilgileri; operasyona özel veri alanları ve kontrollerle ortak entegrasyon yapısında yönetilir.",rate:94.8,rateText:"%94,8",cards:[["1","İhracat Araç","Araç ihracatına ait sevkiyat ve beyanname verileri eşleştirilir; gerekli alanlar kaynak sistemden otomatik alınarak kontrol edilir."],["2","İhracat Yedek Parça","Yedek parça ihracatında kalem bazlı veriler ve belge referansları aktarılır. Vergi bilgisi tescil sonrası ilgili kayda bağlanır; alan ve doğrulama kontrolleri aynı akışta yürütülür."],["3","İhracat Kamyon","Kamyon ihracatına ait araç, sevkiyat ve beyanname bilgileri tek akışta eşleştirilir. Zorunlu alanlar doğrulanarak tescil ve çıkış durumu Ford ekipleri için izlenebilir hâle gelir."],["4","İhracat İntaç (Tek Yönlü)","İhracat beyannamelerine ait intaç tarihi ve sonuç bilgisi ilgili kayıtlara tek yönlü olarak aktarılır. Bu entegrasyon çift yönlü veri alışverişi yapmaz; Ford ekipleri kapanış durumunu ortak görünümden takip eder."]]},
archive:{title:"Arşiv Entegrasyonu",description:"Ford Arşiv Entegrasyon ve Arşiv Fihrist ile evrakları tek havuzda, standart metaveri ve olay bazlı arşivleme yaklaşımıyla yönetir.",rate:100,rateText:"%100",cards:[["1","Hızlı Erişim","Anahtar alanlarla saniyeler içinde arama, görüntüleme ve kayıt ilişkilendirme."],["2","Güvenlik & Loglama","Arşiv erişimleri kullanıcı yetkileriyle kontrol edilir. Erişim ve işlem kayıtları kullanıcı ve zaman bilgileriyle loglanarak belge üzerindeki hareketler izlenebilir hâle getirilir."],["3","Fatura ve Dekont Arşiv Yönetimi","Fatura ve dekontları ilgili beyanname ve dosya referanslarıyla arşiv kayıtlarına bağlar. Ford ekipleri fatura ve ödeme belgelerine aynı işlem üzerinden erişebilir; belge arama ve manuel eşleştirme yükü azalır."]]},
bank:{title:"Banka Entegrasyonu",description:"Beyannameye ait vergi ödeme bilgilerinin banka sistemleriyle entegre şekilde işlenmesini sağlar. Vergi ödemeleri kontrollü, hızlı ve izlenebilir biçimde gerçekleştirilir.",rate:99.2,rateText:"%99,2",cards:[["1","Beyanname Bazlı Vergi Ödemeleri","Vergi ödeme bilgileri ilgili beyannameyle eşleştirilerek banka sistemlerine aktarılır. Ödemeler kontrollü ve izlenebilir biçimde gerçekleştirilir."],["2","Ödeme Takibi & Raporlama","Vergi ödeme kayıtları gerçek zamanlı olarak işlenir ve raporlanır. Ford ekipleri ödeme durumunu ilgili beyanname üzerinden takip eder."]]},
gtb:{title:"GTB Entegrasyonları",description:"Tek Pencere Sistemi, geçici ithalat, nihai kullanım ve IMEI başvuru süreçlerindeki belge, başvuru ve takip bilgileri ortak entegrasyon yapısında birleştirilir. Ford ekipleri ilgili kayıtları ve işlem durumlarını tek görünümde izler.",cards:[["1","Tek Pencere Sistemi","Gümrük işlemlerinde kullanılan izin, onay ve belge başvurularına ait referans ve durum bilgilerini ilgili işlem kayıtlarıyla ilişkilendirir. Başvuru ve belge takibini ortak bir akışta toplar."],["2","Geçici İthalat","Geçici ithalata ait izin, başvuru ve dosya bilgilerini birlikte takip eder. Süre ve kapanış bilgileriyle aksiyon bekleyen kayıtların Ford ekipleri tarafından izlenmesini kolaylaştırır."],["3","Nihai Kullanım","Nihai kullanım izin ve belge bilgilerini ilgili beyanname kayıtlarıyla birleştirir. Başvuru, referans ve işlem durumlarına erişimi kolaylaştırarak takip ve kontrol için ortak veri sağlar."],["4","IMEI Başvuru","IMEI bilgileri ve ilgili başvuru kayıtlarını aynı akışta toplar. Eksik veya tutarsız bilgilerin görülmesini ve başvuru durumunun takip edilmesini kolaylaştırarak kontrollü işlem yürütülmesini destekler."]]},
getApp:{title:"GET-APP Entegrasyonu",description:"GET-APP üzerinden beyanname bilgilerine erişilir; vergi tutarları ve ödeme işlemleri aynı kayıtlar üzerinden kontrol edilir. Ford operasyon ve finans ekipleri için güncel, karşılaştırılabilir ve izlenebilir veri sağlar.",cards:[["1","Beyanname Bilgilerine Erişim","Tüm beyanname bilgileri sistem üzerinden çekilebilir. İlgili dosya ve işlem kayıtlarına aynı veri kaynağı üzerinden erişilir."],["2","Vergi ve Ödeme Doğrulama","Vergi tutarları GET-APP üzerinden kontrol edilerek ödeme işlemleri doğrulanabilir."]]}},
en:{
import:{title:"Import Integration",description:"Ford vehicle imports and general import operations are managed in separate flows with operation-specific data fields, customs accounting information and validation rules.",rate:96.4,rateText:"96.4%",cards:[["1","Vehicle Import","Vehicle-specific data model, validation fields and declaration scenarios."],["2","Import","Item, GTIP, value, tax and document information for import files is retrieved from the source system and matched to declaration records. Field selection and mandatory-data checks support current, consistent data transfer."]]},
export:{title:"Export Integration",description:"From vehicle, spare-part and truck exports to closure tracking, shipment, declaration and closure information is managed through a shared integration structure with operation-specific fields and controls.",rate:94.8,rateText:"94.8%",cards:[["1","Vehicle Export","Vehicle shipment and declaration data is matched. Required fields are retrieved automatically from the source system and validated."],["2","Spare-Part Export","Line-level data and document references are transferred for spare-part exports. Tax information is linked to the relevant record after registration, with field and validation checks in the same flow."],["3","Truck Export","Vehicle, shipment and declaration information for truck exports is matched in one flow. Mandatory fields are validated so Ford teams can track registration and exit status."],["4","Export Closure (One-Way)","Export declarations’ closure dates and results are transferred to the related records through a one-way integration. There is no bidirectional data exchange in this flow; Ford teams track closure status in a shared view."]]},
archive:{title:"Archive Integration",description:"Manages documents in one pool with standard metadata and event-based archiving.",rate:100,rateText:"100%",cards:[["1","Fast Access","Search and view within seconds using key fields."],["2","Security & Logging","Archive access is controlled through user permissions. Access and transaction records are logged with user and timestamp information, making document activity traceable."],["3","Invoice and Receipt Archive Management","Links invoices and payment receipts to archive records through the relevant declaration and file references. Ford teams access invoice and payment documents through the same transaction, reducing document searches and manual matching."]]},
bank:{title:"Bank Integration",description:"Processes tax payment information for declarations through integration with banking systems. Tax payments are made in a controlled, fast and traceable way.",rate:99.2,rateText:"99.2%",cards:[["1","Declaration-Based Tax Payments","Tax payment information is matched to the relevant declaration and transferred to banking systems. Payments are made in a controlled and traceable way."],["2","Payment Tracking & Reporting","Tax payment records are processed and reported in real time. Ford teams track payment status against the relevant declaration."]]},
gtb:{title:"GTB Integrations",description:"Document, application and tracking information across the Single Window System, temporary import, end-use and IMEI application processes is brought together in one integration structure. Ford teams can follow related records and transaction status in a shared view.",cards:[["1","Single Window System","Links references and status information for customs permit, approval and document applications to the relevant transaction records. Brings application and document tracking into a shared flow."],["2","Temporary Import","Tracks temporary-import permit, application and file information together. Deadline and closure information helps Ford teams follow records requiring action."],["3","End-Use","Links end-use permit and document information to the relevant declaration records. Makes application references and transaction status easier to access, providing shared data for tracking and control."],["4","IMEI Application","Brings IMEI information and related application records into one flow. Supports controlled processing by making missing or inconsistent information and application status easier to follow."]]},
getApp:{title:"GET-APP Integration",description:"Declaration information is retrieved through GET-APP, while tax amounts and payment transactions are checked against the same records. Provides current, comparable and traceable data for Ford operations and finance teams.",cards:[["1","Access to Declaration Information","All declaration information can be retrieved through the system. Related file and transaction records can be accessed from the same data source."],["2","Tax and Payment Verification","Tax amounts can be checked through GET-APP to verify payment transactions."]]}}};

const romaniaProjectData={
  aycube:[{
    title:{tr:"Aycube.ro Nedir?",en:"What Is Aycube.ro?"},
    image:"assets/romania/aycube-ro-ana-ekran.png",
    imageAlt:{tr:"Aycube.ro Ana Ekran",en:"Aycube.ro Home Screen"},
    description:{
      tr:"Aycube.ro, Romanya gümrük operasyonlarında iş akışlarını, arşiv kayıtlarını, entegrasyonları ve raporlamayı tek çatı altında toplayan modüler platformumuzdur. Ford Otosan Romanya ekipleri; dosya ve belge bilgilerine, sözlü beyan ve geçici ithalat kayıtlarına ortak bir çalışma alanından ulaşır. Ana ekran; operasyon menülerini, BI raporlarını ve güncel bilgi akışını bir araya getirerek günlük takibi kolaylaştırır.",
      en:"Aycube.ro is our modular platform bringing workflows, archive records, integrations and reporting for Romanian customs operations under one roof. Ford Otosan Romania teams access file and document information, oral declarations and temporary import records through a shared workspace. The home screen brings operational menus, BI reports and current information together to simplify day-to-day tracking."
    },
    points:{
      tr:["Romanya gümrük işlemleri ve raporları için merkezi takip","Dosya, belge ve işlem kayıtlarında uçtan uca izlenebilirlik","Yeni operasyon ihtiyaçlarına uyarlanabilen modüler yapı"],
      en:["Central tracking of Romanian customs operations and reports","End-to-end traceability across files, documents and transaction records","A modular structure adaptable to new operational needs"]
    }
  }],
  archive:[{
    title:{tr:"Doküman Yönetim Sistemi",en:"Document Management System"},
    visual:"documents",
    description:{
      tr:"Romanya gümrük operasyonlarına ait beyanname, fatura ve ek belgeleri ilgili dosya ve işlem referanslarıyla tek merkezde düzenler. Ford Otosan Romanya ekiplerinin ihtiyaç duyduğu dokümanlara daha hızlı ulaşmasını sağlar. Belge arama ve manuel dosyalama yükünü azaltarak arşivde düzenli ve izlenebilir bir yapı oluşturur.",
      en:"Organises declarations, invoices and supporting documents for Romanian customs operations in one place, linked to the relevant files and transaction references. Ford Otosan Romania teams can reach the documents they need faster. It reduces document searches and manual filing work while creating an orderly, traceable archive."
    }
  },{
    title:{tr:"Orijinal Evrak OCR",en:"Original Document OCR"},
    visual:"ocr",
    description:{
      tr:"Taranmış orijinal evraklar üzerindeki metin ve temel belge bilgilerini OCR teknolojisiyle dijital veriye dönüştürür. Elde edilen bilgiler, evrakların ilgili Romanya operasyon dosyalarıyla eşleştirilmesini ve arşivde aranabilir hâle gelmesini destekler. Böylece manuel veri girişi azalır; belgeye erişim ve kontrol süreçleri hızlanır.",
      en:"Uses OCR to convert text and key document information from scanned original documents into digital data. The extracted information supports matching documents to the relevant Romanian operational files and making them searchable in the archive. This reduces manual data entry and speeds up document access and review."
    }
  },{
    title:{tr:"Sözlü Beyan Arşivleri",en:"Oral Declaration Archives"},
    visual:"oral-archive",
    description:{
      tr:"Romanya’da sözlü beyan kapsamında yürütülen işlemlerin belge ve kayıtlarını tarih, dosya ve işlem referanslarıyla bir arada saklar. Ford ekipleri ilgili beyanın destekleyici evraklarına tek noktadan ulaşabilir ve geçmiş işlemleri geriye dönük inceleyebilir. Beyan kaydı ile evrakın birlikte tutulması, operasyonel kontrolü ve denetim hazırlığını kolaylaştırır.",
      en:"Keeps documents and records for oral declaration operations in Romania together with their dates, file and transaction references. Ford teams can access supporting documents from one place and review past transactions. Keeping declaration records and documents together simplifies operational checks and audit preparation."
    }
  }],
  integration:[{
    title:{tr:"TBR Raporu (Yarı Entegrasyon)",en:"TBR Report (Partial Integration)"},
    visual:"tbr",
    description:{
      tr:"TBR raporundaki verileri Romanya operasyon kayıtlarıyla ilişkilendiren yarı entegre çalışma modelidir. Veri hazırlama ve aktarım adımları sistem desteğiyle ilerlerken, gerekli kontroller ve tamamlayıcı işlemler kullanıcı tarafından yürütülür. Rapor ile işlem kayıtlarının tutarlı biçimde takip edilmesini sağlayarak tekrarlı veri girişi ve manuel kontrol yükünü azaltır.",
      en:"A partially integrated workflow that links TBR report data to Romanian operational records. Data preparation and transfer are supported by the system, while users carry out the required checks and completing steps. Consistent tracking of the report and transaction records helps reduce repeated data entry and manual review work."
    }
  }],
  special:[{
    title:{tr:"Sözlü Beyan (Oral Declaration)",en:"Oral Declaration"},
    image:"assets/romania/sozlu-beyan-aycube-ro.png",
    imageAlt:{tr:"Aycube.ro Sözlü Beyan ekranı",en:"Aycube.ro Oral Declaration screen"},
    description:{
      tr:"Romanya operasyonlarında sözlü beyan kapsamında yürütülen gümrük işlemlerini dijital olarak kayıt altına alır. Eşya bilgileri, işlem tarihleri ve ilgili belge referansları tek dosyada toplanır; Ford ekipleri beyanları, işlem durumlarını ve takip gerektiren kayıtları ortak bir görünümden izler. Böylece sözlü beyanla yürütülen operasyonun kayıt bütünlüğü ve geriye dönük izlenebilirliği güçlenir.",
      en:"Digitally records customs operations handled through oral declarations in Romania. Goods information, transaction dates and related document references are brought together in one file, allowing Ford teams to follow declarations, transaction status and records requiring attention in a shared view. This strengthens record consistency and retrospective traceability."
    }
  },{
    title:{tr:"Geçici İthalat (Temporary Import)",en:"Temporary Import"},
    image:"assets/romania/gecici-ithalat-aycube-ro.png",
    imageAlt:{tr:"Aycube.ro Geçici İthalat ekranı",en:"Aycube.ro Temporary Import screen"},
    description:{
      tr:"Romanya’ya geçici olarak getirilen eşyaya ilişkin giriş, izin, süre ve yeniden ihracat veya kapanış bilgilerini tek dosyada izler. Açık kayıtları, yaklaşan süreleri ve tamamlanması gereken işlemleri Ford ekipleri için görünür hâle getirir. Eşya ve belge referanslarını bir arada tutarak girişten rejimin kapanışına kadar düzenli takip ve izlenebilirlik sağlar.",
      en:"Tracks entry, authorisation, deadlines and re-export or closure information for goods temporarily brought into Romania in one file. Open records, approaching deadlines and outstanding actions become visible to Ford teams. Keeping goods and document references together supports consistent tracking and traceability from entry to closure of the procedure."
    }
  }]
};

const romaniaOtomailReports=[
  {title:"ScoreCard Report",icon:"scorecard",description:{tr:"Operasyonel performansı skor kart görünümünde ekiplerin değerlendirmesine sunar.",en:"Shares a scorecard view of operational performance for teams to review."}},
  {title:"Train Report",icon:"train",description:{tr:"Tren taşımalarına ilişkin operasyon bilgilerini ekiplerle paylaşır.",en:"Shares operational information on rail shipments with the teams."}},
  {title:"Monthly Import",icon:"import",description:{tr:"Aylık ithalat operasyonlarına ait rapor verilerini bir araya getirir.",en:"Brings together reporting data for monthly import operations."}},
  {title:"Monthly Export",icon:"export",description:{tr:"Aylık ihracat operasyonlarına ait rapor verilerini bir araya getirir.",en:"Brings together reporting data for monthly export operations."}},
  {title:"General Report (YTD Report)",icon:"chart",description:{tr:"Yıl başından bugüne operasyonların genel görünümünü ekiplerle paylaşır.",en:"Shares an overview of operations from the start of the year to date."}},
  {title:"Arad T2 Report",icon:"location",description:{tr:"Arad T2 süreçlerine ait rapor çıktısını ilgili ekiplerle paylaşır.",en:"Shares report output for Arad T2 processes with the relevant teams."}}
];

const romaniaAycubeProjectGroups=[
  {
    title:{tr:"BI",en:"BI"},
    projects:{
      tr:["Romanya Skor Kart","Romanya Fatura BI","Romanya Genel Grafik","Romanya İhracat Grafik","Romanya İthalat Grafik"],
      en:["Romania Scorecard","Romania Invoice BI","Romania Overview Chart","Romania Export Chart","Romania Import Chart"]
    }
  },
  {
    title:{tr:"Arşiv",en:"Archive"},
    projects:{
      tr:["Romanya İhracat Raporu","Romanya İthalat Raporu","E-Arşiv"],
      en:["Romania Export Report","Romania Import Report","E-Archive"]
    }
  },
  {
    title:{tr:"Operasyon",en:"Operations"},
    projects:{
      tr:["Sözlü Beyan","Geçici İthalat","Fatura Yükleme","Beyanname Yükleme","Material Kod Arama","SAP Excel Yükleme"],
      en:["Oral Declaration","Temporary Import","Invoice Upload","Declaration Upload","Material Code Search","SAP Excel Upload"]
    }
  }
];

const projectCatalog={
tr:[
  ["Gümrük & Takip",["Geçici İthalat Takip","İthalat Beyanname Raporu Detaylı","İthalat Beyanname Raporu","İhracat Beyanname Raporu","İhracat Beyanname Raporu Detaylı","Beyanname Durum Bilgisi","Beyanname Tescil Kontrolü","Yedek Parça Dekont ve Beyanname Görüntüsü","Bankaya Gönderilen Beyanname Görüntüsü","Ford’a Özel Aycube BI’lar — 14 özel BI","Kapı Bildirimleri","Beyanname Durum Bilgileri"]],
  ["Entegrasyon & Veri",["İthalat Entegrasyonu","İhracat Entegrasyonu","Arşiv Entegrasyonu","Banka Entegrasyonu","GTB Entegrasyonları","GET-APP Entegrasyonu"]],
  ["RPA & OCR",["Ford Toplu Fatura Kesim","Ford İNTAÇ Sorgulama","Akıllı Fatura Ayrıştırma – OCR Servisi","Vergi Ödeme"]],
  ["Finans & Komisyon",["Bankaya Gönderilen Beyanname Görüntüsü","Toplu Fatura","Vergi Talep","Ekstre Gönderiminin Otomatize Edilmesi"]],
  ["Arşiv & Doküman",["Arşiv Fihrist","Arşiv Doküman Yönetim Sistemi","Toplu Evrak Talep"]]
],
en:[
  ["Customs & Tracking",["Temporary Import Tracking","Detailed Import Declaration Report","Import Declaration Report","Export Declaration Report","Detailed Export Declaration Report","Declaration Status Information","Declaration Registration Check","Spare-Part Receipt and Declaration Image","Declaration Image Sent to the Bank","Ford-Specific Aycube BI Dashboards — 14 custom BI dashboards","Gate Notifications","Declaration Status Details"]],
  ["Integration & Data",["Import Integration","Export Integration","Archive Integration","Bank Integration","GTB Integrations","GET-APP Integration"]],
  ["RPA & OCR",["Ford Bulk Billing","Ford INTAÇ Query","Smart Invoice Separation – OCR Service","Tax Payment"]],
  ["Finance & Commission",["Declaration Image Sent to the Bank","Bulk Billing","Tax Request","Automated Statement Delivery"]],
  ["Archive & Document",["Archive Index","Archive Document Management System","Bulk Document Request"]]
]};
const reportCatalog={
tr:[["İthalat & Beyanname",["Ford Haftalık Eksik Evrak Raporu","Ford Eksik Evrak Raporu","Detaylı İthalat Raporları","Ford Beyanname Raporu","Ford Serbest Dolaşıma Giriş Listesi YP Raporu","Ford İthalat Raporu","Ford İthalat Raporu","Ford İstatistiki Kıymet Raporu","Ford ÖTV Raporu","Ford Navlun Raporu","Ford IMEI Raporu","İkileme Raporu"]],["İhracat",["Ford İhracat GTİP Bazlı Raporu","Ford İhracat Raporu (0100)","Ford İhracat Raporu 0100-Cargo","Ford İhracat Raporu","Ford Parça İhracat Raporu","Ford Geçici İhracat Raporu","Ford İntaç Raporu","Ford Günlük Araç İhracat Raporu","Ford İhracat Ceza Raporu","Ford Sandık Raporu","Ford VW İhracat Raporu","Ford Araç İhracat Raporu"]],["Finans & Ödeme",["Ford Dekont Raporu","Ford Ödeme Raporu","Ford Samandıra Dekont Raporu","Aygen Ford Ödeme Listesi Raporu"]],["Uyum & Teşvik",["Ford Ceza Takip Raporu","Ford Ar-Ge Raporu","Ford Yatırım Teşvik Raporu","Ford Nihai Kullanım Raporu","Ford İhracat GTİP Bazlı Raporu"]],["Saha & Arşiv",["Gümrüklü Saha Listesi Raporu","Gümrüklü Saha Listesi Ford Dışı Antrepo Raporu","YP Kapı Bildirim Raporu","Ford Arşiv Kontrol Raporu"]]],
en:[["Import & Declaration",["Ford Weekly Missing-Document Report","Ford Missing-Document Report","Detailed Import Reports","Ford Declaration Report","Ford Free-Circulation Entry List — Spare Parts Report","Ford Import Report","Ford Import Report","Ford Statistical Value Report","Ford SCT Report","Ford Freight Report","Ford IMEI Report","Duplication Control Report"]],["Export",["Ford GTIP-Based Export Report","Ford Export Report (0100)","Ford Export Report 0100-Cargo","Ford Export Report","Ford Spare-Parts Export Report","Ford Temporary Export Report","Ford INTAÇ Report","Ford Daily Vehicle Export Report","Ford Export Penalty Report","Ford Crate Report","Ford VW Export Report","Ford Vehicle Export Report"]],["Finance & Payment",["Ford Receipt Report","Ford Payment Report","Ford Samandıra Receipt Report","Aygen Ford Payment List Report"]],["Compliance & Incentives",["Ford Penalty Tracking Report","Ford R&D Report","Ford Investment-Incentive Report","Ford End-Use Report","Ford GTIP-Based Export Report"]],["Field & Archive",["Customs Field List Report","Customs Field List — Non-Ford Warehouse Report","Spare-Parts Gate Notification Report","Ford Archive-Control Report"]]]};
const otomailReports=reportCatalog.tr.flatMap((trGroup,categoryIndex)=>trGroup[1].map((trTitle,itemIndex)=>({
  title:{tr:trTitle,en:reportCatalog.en[categoryIndex]?.[1]?.[itemIndex]||trTitle},
  category:{tr:trGroup[0],en:reportCatalog.en[categoryIndex]?.[0]||trGroup[0]}
}))).map((report,index)=>{
  const number=String(index+1).padStart(2,"0");
  return {...report,id:`otomail-${number}`,fileName:`ford_otomail_${number}.xlsx`};
});

const specialData={
tr:{
archiveIndex:["ARCHIVE INDEX","Arşiv Fihrist","Orijinal evrakların konumu hızlıca tespit edilerek erişim süresi kısalır. Dosya veya beyanname numarasıyla Ford fiziksel arşivindeki raf ve konum bilgisine ulaşılır.",["Dosya / Beyanname bazlı sorgulama","Raf ve fiziksel konum bilgisi","Orijinal evrak konum takibi","Hızlı arama ve erişim"],"search"],
gate:["CUSTOMS GATE NOTIFICATIONS","Gümrük Kapı Bildirimleri","Gümrükte kapı bildirimi, bir aracın veya taşıma işleminin gümrük kapısına giriş ya da çıkış yaptığının gümrük sistemine bildirilmesi ve kayıt altına alınmasıdır. Kısaca, ‘Araç gümrük kapısına geldi veya geçti’ bilgisinin sisteme işlenmesidir. Bu kayıt, taşıtın ve ilgili yükün sonraki gümrük işlemlerinin takip edilmesini sağlar.",["Araç veya taşıma işleminin gümrük kapısına geliş ya da geçiş kaydı","Giriş ve çıkış bilgisinin gümrük sistemine işlenmesi","Taşıt ile ilgili yükün sonraki gümrük işlemleriyle ilişkilendirilmesi","Kapı hareketinin kayıt üzerinden izlenebilmesi"],"flow"],
declarationImage:["DECLARATION IMAGE","Bankaya Gönderilen Beyanname Görüntüsü","Tescil beyanname görüntüsünün kontrollü şekilde alınması, bankaya iletilmesi ve gönderim kayıtlarının izlenmesi.",["Manuel e-posta ve ek yönetimini azaltır","Gönderim zamanı ve alıcı logları","Tekrar deneme ve hata uyarısı","Ödeme ve teminat akışlarıyla bağlantı"],"flow"]},
en:{
archiveIndex:["ARCHIVE INDEX","Archive Index","Original documents are located quickly, shortening access time. A file or declaration number identifies the shelf and position in Ford’s physical archive.",["File / declaration-based queries","Shelf and physical location information","Original document location tracking","Fast search and access"],"search"],
gate:["CUSTOMS GATE NOTIFICATIONS","Customs Gate Notifications","A customs gate notification is the notification and recording in the customs system that a vehicle or transport operation has entered or exited a customs gate. In short, it records that the vehicle has arrived at or passed through the customs gate. This record enables the vehicle and its related cargo to be tracked through subsequent customs procedures.",["Recording a vehicle or transport operation arriving at or passing through the customs gate","Entering gate arrival and exit information into the customs system","Linking the vehicle and cargo to subsequent customs procedures","Tracking the gate movement through the recorded entry"],"flow"],
declarationImage:["DECLARATION IMAGE","Declaration Image Sent to Bank","Controlled retrieval, bank delivery and tracking of registered declaration images.",["Reduces manual email and attachment handling","Delivery time and recipient logs","Retry and error alerts","Connection to payment and guarantee flows"],"flow"]}};

const specialProjectBenefits={
tr:{
archiveIndex:["Orijinal evrakların konumu saniyeler içinde bulunur.","Fiziksel arşivde evrak arama süresi azalır.","Kayıp veya yanlış yerde aranan evrak riski azalır.","Denetimlerde ihtiyaç duyulan orijinal evraklara hızlı erişim sağlanarak arama süresi ve iş gücü maliyeti düşürülür."],
gate:["Araç ve yük hareketleri anlık görünür","Gümrük takip süresi kısalır","Eksik veya uyumsuz kayıt riski azalır"],
declarationImage:["Manuel e-posta ve ek yönetimi azalır","Banka gönderimleri izlenebilir hâle gelir","Ödeme ve teminat süreçleri hızlanır"]
},
en:{
archiveIndex:["The location of original documents is found within seconds.","Time spent searching for documents in the physical archive decreases.","The risk of missing documents or searching in the wrong location decreases.","Fast access to original documents required during audits reduces search time and labour costs."],
gate:["Vehicle and cargo movements become instantly visible","Customs tracking time is shortened","Missing or inconsistent record risk decreases"],
declarationImage:["Manual email and attachment work decreases","Bank deliveries become traceable","Payment and guarantee processes accelerate"]
}};

const rpaProjectData={
tr:{
taxPayment:["","Vergi Ödeme","Vergi Ödeme projesi, beyannamelere ait vergi ödeme adımlarını BerkBOT altyapısıyla otomatikleştirir. Beyanname referansı ve vergi tutarı işlem öncesinde kontrol edilir; ödeme işlemleri tanımlı yetki ve iş kuralları çerçevesinde yürütülür. İşlem sonuçları ilgili dosya kayıtlarıyla ilişkilendirilir, hata ve istisnalar loglanarak Ford operasyon ve finans ekipleri için izlenebilir hâle getirilir. Böylece tekrarlayan manuel ödeme adımları azalır, süreç daha kontrollü ve hızlı ilerler.",["Beyanname ve vergi tutarının işlem öncesinde kontrolü","Vergi ödeme adımlarının RPA ile otomasyonu","Ödeme sonucunun ilgili dosya kaydıyla ilişkilendirilmesi","Hata ve istisnaların loglanarak takip edilmesi"],"flow"],
berkbot:["","BerkBOT | Akıllı Otomasyon Platformu","BerkBOT, şirketimiz bünyesinde geliştirdiğimiz yapay zekâ destekli RPA otomasyon platformudur. Tekrarlayan operasyonel süreçleri uçtan uca otomatikleştirirken iş gücü ve zaman tasarrufu sağlar, kullanıcı kaynaklı hataları minimum seviyeye indirmeyi hedefler. Süreçte karşılaştığı hata ve istisnalardan öğrenen yapısı; kontrol setleri, çapraz doğrulama mekanizmaları ve yapay zekâ destekli kontrollerle olası sorunları işlem gerçekleşmeden önce tespit eder, değerlendirir ve mümkün olan durumlarda otomatik olarak düzeltir. Böylece yalnızca işleri otomatikleştiren değil, operasyonel kaliteyi sürekli geliştiren akıllı bir altyapı sunar.",["Tekrarlayan operasyonel işlemlerin uçtan uca otomasyonu","Kullanıcı kaynaklı hataların işlem öncesinde tespiti","Kontrol setleri ve çapraz doğrulama mekanizmaları","Hata ve istisnalardan öğrenen gelişen yapı","Uygun senaryolarda otomatik düzeltme ve kesintisiz tamamlama"],"flow"],
fordBilling:["FORD TOPLU FATURA PROJESİ","Ford Toplu Fatura Kesim Sistemi","Ford Toplu Fatura Kesim Sistemi, ay boyunca oluşan masraf ve fatura kalemlerini otomatik analiz eden; verileri cari kod bazında konsolide ederek ay sonunda tek seferde toplu faturalandıran akıllı bir otomasyon çözümüdür. BerkBOT altyapısı üzerinde çalışan sistem, OCR ve yapay zekâ destekli kontrollerle eksik, hatalı veya tutarsız kayıtları belirler; mümkün olan durumlarda otomatik düzeltme uygulayarak süreci kullanıcı müdahalesine ihtiyaç duymadan tamamlar. Faturalandırma sonrasında Muhasebe, Operasyon ve Yönetim ekiplerine cari tutarlar, işlem adetleri, masraf dağılımları ile hata ve istisna kayıtlarını içeren ayrıntılı ve izlenebilir raporlar sunar.",["Aylık masraf ve fatura kalemlerinin otomatik analizi","Cari kod bazında konsolidasyon ve tek seferde toplu faturalandırma","OCR ve yapay zekâ destekli eksik, hata ve tutarsızlık kontrolü","Uygun kayıtlarda otomatik düzeltme ve müdahalesiz tamamlama","Muhasebe, Operasyon ve Yönetim için cari bazlı izlenebilir raporlama"],"flow"],
invoiceOcr:["AKILLI FATURA OCR PROJESİ","Akıllı Fatura Ayrıştırma – OCR Servisi","Toplu PDF faturalar OCR teknolojisiyle otomatik olarak analiz edilir ve her belgedeki fatura numarası tespit edilir. Sistem, faturaları Ford için tanımlanan klasör yapısına göre ayrıştırır; her faturayı kendi numarasıyla ayrı bir PDF olarak kaydeder. Böylece manuel dosyalama ihtiyacı ortadan kalkar, belge karışıklığı azalır ve Ford operasyon ekipleri işlenmeye hazır faturalara daha hızlı ulaşır.",["Toplu PDF faturaların tek işlemde OCR ile analizi","Fatura numarasının belge üzerinden otomatik tespiti","Ford için tanımlanan klasörlere kural bazlı ayrıştırma","Her faturanın kendi numarasıyla ayrı PDF olarak kaydedilmesi","Manuel dosyalamanın kaldırılması ve operasyon süresinin kısalması"],"flow"]},
en:{
berkbot:["","BerkBOT | Intelligent Automation Platform","BerkBOT is our in-house AI-powered RPA automation platform. It automates repetitive operational processes end to end, saving workforce capacity and time while minimising user-driven errors. Its learning structure evaluates errors and exceptions encountered during a process; control sets, cross-validation mechanisms and AI-assisted checks identify potential issues before execution and automatically correct them whenever possible. BerkBOT therefore provides an intelligent foundation that continuously improves operational quality rather than simply automating tasks.",["End-to-end automation of repetitive operational tasks","Pre-transaction detection of user-driven errors","Control sets and cross-validation mechanisms","A structure that learns from errors and exceptions","Automatic correction and unattended completion where applicable"],"flow"],
taxPayment:["","Tax Payment","The Tax Payment project automates declaration-based tax payment steps through the BerkBOT platform. Declaration references and tax amounts are checked before processing, and payments follow defined permissions and business rules. Results are linked to the relevant file records, while errors and exceptions are logged for traceability by Ford operations and finance teams. This reduces repetitive manual payment steps and makes the process faster and more controlled.",["Pre-transaction checks of declaration references and tax amounts","RPA automation of tax payment steps","Linking payment results to the relevant file record","Logging and tracking errors and exceptions"],"flow"],
fordBilling:["FORD BULK BILLING AUTOMATION","Ford Bulk Billing System","The Ford Bulk Billing System automatically analyses expense and invoice items accumulated throughout the month, consolidates them by account code and generates bulk billing in a single month-end run. Operating on the BerkBOT platform, the system uses OCR and AI-assisted controls to detect missing, incorrect or inconsistent records and applies automatic corrections whenever possible, completing the process without user intervention. After billing, it provides Accounting, Operations and Management teams with detailed, traceable reports covering account-based amounts, transaction counts, expense distributions, errors and exceptions.",["Automated analysis of monthly expense and invoice items","Account-code consolidation and single-run bulk billing","OCR and AI-assisted checks for missing, incorrect or inconsistent data","Automatic correction and unattended completion where applicable","Traceable account-based reporting for Accounting, Operations and Management"],"flow"],
invoiceOcr:["SMART INVOICE OCR","Smart Invoice Separation – OCR Service","Bulk PDF invoices are analysed automatically with OCR technology and the invoice number on each document is detected. The service separates invoices according to the folder structure defined for Ford, then saves every invoice as an individual PDF named with its invoice number. This removes manual filing, reduces document mix-ups and helps Ford operations teams reach processing-ready invoices faster.",["OCR analysis of bulk PDF invoices in a single run","Automatic detection of the invoice number","Rule-based separation into folders defined for Ford","Each invoice saved as an individual PDF with its own number","Removal of manual filing and a shorter operational cycle"],"flow"]}};

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
    {
      src:"assets/aycube_screens/arsiv-fihrist.png",
      label:{tr:"Arşiv Fihrist",en:"Archive Index"},
      description:{
        tr:"Beyanname ve eklerine ait orijinal evrakların Ford fiziksel arşivindeki raf ve konum bilgilerini kayıt altında tutar. Dosya veya beyanname numarası üzerinden evrakın bulunduğu yer hızlıca tespit edilir.",
        en:"Records the shelf and physical locations of original documents belonging to declarations and their attachments in Ford’s physical archive. The document’s location is identified quickly using a file or declaration number."
      }
    }
  ],
  gate:[],
  declarationImage:[]
};

const speakerScripts={
tr:[
"Açılış mesajı tek: Aygen IT; entegrasyon, otomasyon, raporlama ve saha görünürlüğünü Ford operasyonları için tek dijital omurgada birleştiriyor. 29 proje ve 37 dijital iş akışı, dağınık çözümler değil, aynı ölçeklenebilir ekosistemin parçalarıdır.",
"Hikâyeyi beş eksende kuruyoruz: net sahiplik, tek platform, otomasyonla güçlenen karar ritmi, güvenlik ve sürdürülebilirlik. Her eksen, bir sonrakinin zeminini hazırlıyor.",
"Bu bölüm teknolojiyi taşıyan altı kişilik IT kadromuzu gösteriyor. Liderlik, yazılım geliştirme, iş analizi, RPA, yapay zekâ ve yetişen yeni yetenekler aynı ekip yapısı içinde Ford operasyonlarına uçtan uca dijital çözümler sunuyor.",
"İş birliği modelimizin farkı ortak ve sürdürülebilir sonuç üretme ritmidir. Yakın çalışma ile başlayan süreç; analiz, geliştirme, güvenli mimari, hızlı iterasyon ve kontrollü teslimat adımlarıyla ilerler. Böylece Ford operasyonlarında karar süresi kısalır, güvenilir ve anlamlı veriye daha hızlı ulaşılır.",
"Aycube bölümünde ana mesaj tek platform mantığı. Ford için geliştirilen projeler; gümrük takip, entegrasyon, otomasyon, finans ve arşiv başlıklarında toplanıyor. Gümrük & Takip kartında ekranların her biri ayrı proje olarak sayılır ve 12 proje numaralı biçimde sunulur; Ford’a özel 14 Aycube BI da bu kapsamda görünür. Finans & Komisyon alanında bankaya gönderilen beyanname görüntüsü, toplu fatura, vergi talep ve otomatik ekstre gönderimi olmak üzere dört proje yer alır. Arşiv & Doküman alanı üç projeden oluşur.",
"Otomail, Ford Otosan ekipleri için hazırlanan 37 operasyonel raporu zamanında üreten, doğrulayan ve yalnızca yetkili alıcılara güvenle ulaştıran otomatik rapor dağıtım servisidir. Akış 37 raporun tamamını sırayla gösterir. Günlük yaklaşık 147, haftalık 1.035, aylık yaklaşık 4.497 ve yıllık 53.966 rapor gönderimi; teslim kayıtları, hata uyarıları ve izlenebilir yeniden denemelerle yönetilir.",
"Özel projelerde sahadaki somut ihtiyaçlara üretilen nokta çözümleri gösteriyoruz: arşiv fihrist, gümrük kapı bildirimleri ve bankaya giden beyanname görüntüleri. Buradaki kapı bildirimi Supalan süreci değildir; gümrüklü sahaya giren veya sahadan çıkan aracın plaka, beyanname ya da taşıma kaydı, kapı ve zaman bilgileriyle eşleştirilerek ilgili gümrük dosyasına bağlanmasıdır. Böylece eksik veya uyumsuz hareketler görünür, yetkili ekipler için denetlenebilir bir işlem izi oluşur.",
"",
"Supalan bölümünde fiziksel saha ile dijital kontrolü birlikte görüyoruz. Araç ve şoför bilgileri tır giriş formunda toplanıp Aycube’da kayıt altında tutuluyor; giriş ve çıkışlar plaka tanıma, güvenlik kontrolü ve sisteme entegre 40 kameralı altyapıyla izleniyor. Gümrüklü araçlarda vergi ödemesi ve ilgili gümrük adımları tamamlanana kadar bekleme statüsü takip ediliyor. Giriş, çıkış ve transit sürelerini içeren raporlarımız Ford’a zaman görünürlüğü sağlıyor; Ford ekipleri demuraj değerlendirmesini bu raporlardaki verilerle yapıyor. Olay bildirimleri ile ithalat ve ihracat raporları yetkili ekiplere e-posta yoluyla iletiliyor. Ekrandaki sayısal veriler örnektir.",
"Kapanış, veriyle görünür hale gelen operasyonun artık somut aksiyona dönüşebileceğini vurguluyor. Aygen IT ve Ford Otosan iş birliğini, geleceği birlikte şekillendiren uzun vadeli bir ortaklık mesajıyla tamamlıyoruz."
],
en:[
"The opening message is simple: Aygen IT unifies integration, automation, reporting and field visibility into one digital backbone for Ford operations. The 29 projects and 37 report flows are parts of the same scalable ecosystem.",
"The story follows five pillars: clear ownership, one platform, an automation-powered decision rhythm, security and sustainability. Each pillar creates the foundation for the next.",
"This section introduces our six-person IT team. Leadership, software development, business analysis, RPA, AI and emerging talent come together to deliver end-to-end digital solutions for Ford operations.",
"The differentiator is a shared rhythm focused on sustainable outcomes. Starting with close collaboration, the process moves through analysis, development, secure architecture, fast iteration and controlled delivery. This shortens decision cycles and provides Ford operations with faster access to reliable, meaningful data.",
"The Aycube section communicates the single-platform logic. Ford projects are grouped under customs tracking, integration, automation, finance and archive capabilities. In Customs & Tracking, every screen is counted as a distinct project and the 12 projects are numbered individually; the scope also makes Ford’s 14 custom Aycube BI dashboards explicit. Finance & Commission contains four projects: declaration images sent to the bank, bulk billing, tax requests and automated statement delivery. Archive & Document contains three projects.",
"Otomail is the automated report-distribution service that generates and validates 37 operational reports for Ford Otosan teams, then securely delivers them only to authorised recipients. The flow cycles through all 37 reports in sequence. Approximately 147 daily, 1,035 weekly, 4,497 monthly and 53,966 yearly deliveries are managed with delivery logs, error alerts and traceable retries.",
"Special projects show targeted solutions for concrete operational needs: archive index, customs gate notifications and declaration images sent to the bank. The gate notification shown here is not the Supalan process; it links a vehicle entering or leaving a customs-controlled site to its customs file through plate, declaration or transport record, gate and timestamp data. Missing or inconsistent movements become visible and authorised teams receive an auditable transaction trail.",
"",
"The Supalan section brings the physical site and digital control together. Vehicle and driver data is collected through the truck-entry form and retained in Aycube; entry and exit are monitored through plate recognition, security checks and an integrated 40-camera infrastructure. Customs-controlled vehicles remain in a waiting status until tax payment and the relevant customs steps are complete. Our entry, exit and transit-duration reports give Ford time visibility, and Ford teams make the demurrage assessment using the report data. Event notifications and import / export reports are delivered to authorised teams by email. The figures shown are illustrative.",
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
warmSlideAssets(current);warmSlideAssets(current+1);warmSlideAssets(current+2);
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
if(window.matchMedia("(max-width: 1120px)").matches){
  requestAnimationFrame(()=>window.scrollTo(0,0));
}
document.dispatchEvent(new CustomEvent("presentation:slidechange",{detail:{index:current}}));
}
function navigate(index,useCurtain=true){
const next=Math.max(0,Math.min(index,slides.length-1));if(next===current||busy)return;
const transitionRequest=new CustomEvent("presentation:slidewillchange",{detail:{index:next,from:current},cancelable:true});
if(!document.dispatchEvent(transitionRequest)){commitSlide(next);scheduleAdjacentWarmup(current);return}
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
$("#integrationTitle").textContent=d.title;$("#integrationDescription").textContent=d.description;
const flowColumns=$("#flowColumns");
flowColumns.classList.remove("is-export","is-three");
flowColumns.classList.add("is-split");
const benefitsTitle=lang==="tr"?"Ford İçin Kazanımlar":"Benefits for Ford";
const benefits=key==="export"?integrationExportBenefits[lang]:(integrationBenefits[lang]?.[key]||[]).flat();
flowColumns.innerHTML=`<section class="integration-projects-grid" aria-label="${d.title}">${d.cards.map(c=>`<article class="integration-project-item"><span class="integration-project-number" aria-hidden="true">${c[0]}</span><div><h4>${c[1]}</h4><p>${c[2]}</p></div></article>`).join("")}</section><aside class="integration-benefits-grid" aria-label="${benefitsTitle}">${benefitMarkup(benefits,benefitsTitle)}</aside>`;
$(".integration-stage").animate([{opacity:.45,transform:"translateY(10px)"},{opacity:1,transform:"translateY(0)"}],{duration:420,easing:"cubic-bezier(.22,1,.36,1)"});
}
function romaniaAycubeCatalogMarkup(){
  const projectLabel=lang==="tr"?"proje":"projects";
  const total=romaniaAycubeProjectGroups.reduce((sum,group)=>sum+group.projects[lang].length,0);
  return `<section class="romania-screen-catalog" aria-labelledby="romaniaScreenCatalogTitle"><div class="romania-screen-catalog-heading"><h3 id="romaniaScreenCatalogTitle">${lang==="tr"?"Aycube.ro Projeleri":"Aycube.ro Projects"}</h3><span>${total} ${projectLabel}</span></div><div class="romania-screen-groups">${romaniaAycubeProjectGroups.map(group=>`<article class="romania-screen-group"><header><h4>${group.title[lang]}</h4><span>${group.projects[lang].length} ${projectLabel}</span></header><ul>${group.projects[lang].map(project=>`<li>${project}</li>`).join("")}</ul></article>`).join("")}</div></section>`;
}
function romaniaProjectIcon(type){
  const paths={
    documents:'<path d="M3 7h6l2 2h10v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/><path d="M3 7V5a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v2"/>',
    document:'<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
    ocr:'<path d="M8 3H4a1 1 0 0 0-1 1v4m13-5h4a1 1 0 0 1 1 1v4M3 16v4a1 1 0 0 0 1 1h4m8 0h4a1 1 0 0 0 1-1v-4M7 8h10M7 12h10M7 16h6"/>',
    "oral-archive":'<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9M9 13h6M10 16h4"/>',
    tbr:'<rect x="2" y="3" width="7" height="7" rx="2"/><rect x="15" y="14" width="7" height="7" rx="2"/><path d="M9 6h6a4 4 0 0 1 4 4v4M15 18H9a4 4 0 0 1-4-4v-4"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    user:'<circle cx="12" cy="7" r="3"/><path d="M5 21v-3a7 7 0 0 1 14 0v3"/>',
    mail:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>',
    scorecard:'<path d="M5 20V10m7 10V4m7 16v-7M3 20h18"/><path d="m4 6 3-3 3 3"/>',
    train:'<rect x="5" y="3" width="14" height="15" rx="4"/><path d="M5 10h14M12 3v7M7 21l2-3m8 3-2-3"/><circle cx="9" cy="14" r="1"/><circle cx="15" cy="14" r="1"/>',
    import:'<path d="M12 3v11m-4-4 4 4 4-4M5 12H3v8a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-8h-2"/>',
    export:'<path d="M12 14V3m-4 4 4-4 4 4M5 12H3v8a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-8h-2"/>',
    chart:'<path d="M3 3v18h18M6 16l5-6 4 3 5-8m-5 0h5v5"/>',
    location:'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/>'
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[type]||paths.document}</svg>`;
}
function romaniaProjectVisualMarkup(type){
  const text=lang==="tr"?{
    documents:["Belge akışı","Beyanname","Fatura","Ek belgeler","Dosya & belge arşivi","Dosya ile eşleştir","Arşivde eriş"],
    ocr:["OCR ile dijital kayıt","Orijinal evrak","Belge bilgisi","Dosya referansı","Aranabilir metin","Manuel giriş azalır"],
    "oral-archive":["Beyan ve evrak birlikte","Sözlü beyan kaydı","Tarih","Dosya","Referans","Beyan kaydı","Destekleyici evrak","Geriye dönük izlenebilirlik"],
    tbr:["Yarı entegre çalışma modeli","TBR Raporu","Rapor verisi","Veri hazırlama","Sistem desteği","Romanya kayıtları","Aycube.ro","Sistem","Hazırlama & aktarım","Kullanıcı","Kontrol & tamamlama","Rapor ve kayıt tutarlılığı"]
  }:{
    documents:["Document flow","Declaration","Invoice","Supporting documents","File & document archive","Link to file","Access in archive"],
    ocr:["Digital records with OCR","Original document","Document data","File reference","Searchable text","Less manual entry"],
    "oral-archive":["Declaration and documents together","Oral declaration record","Date","File","Reference","Declaration record","Supporting documents","Retrospective traceability"],
    tbr:["Partially integrated workflow","TBR Report","Report data","Data preparation","System support","Romanian records","Aycube.ro","System","Preparation & transfer","User","Review & completion","Report and record consistency"]
  };
  const t=text[type];
  if(!t)return"";
  let body="";
  if(type==="documents"){
    body=`<div class="ro-document-inputs">${t.slice(1,4).map(label=>`<span>${romaniaProjectIcon("document")}<b>${label}</b></span>`).join("")}</div><div class="ro-document-connector" aria-hidden="true"></div><div class="ro-document-hub">${romaniaProjectIcon("documents")}<div><strong>Aycube.ro</strong><small>${t[4]}</small></div></div><div class="ro-visual-footer"><span>${t[5]}</span><i aria-hidden="true">→</i><span>${t[6]}</span></div>`;
  }else if(type==="ocr"){
    body=`<div class="ro-ocr-flow"><div class="ro-ocr-paper"><span>${t[1]}</span><div class="ro-paper-lines" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div><div class="ro-ocr-scan-line" aria-hidden="true"></div><b>OCR</b></div><span class="ro-flow-arrow" aria-hidden="true">→</span><div class="ro-ocr-output">${t.slice(2,5).map(label=>`<span>${romaniaProjectIcon("check")}<b>${label}</b></span>`).join("")}</div></div><div class="ro-visual-footer ro-visual-result">${romaniaProjectIcon("check")}<span>${t[5]}</span></div>`;
  }else if(type==="oral-archive"){
    body=`<div class="ro-archive-record"><div class="ro-archive-record-title">${romaniaProjectIcon("oral-archive")}<strong>${t[1]}</strong></div><div class="ro-record-fields">${t.slice(2,5).map(label=>`<span>${label}<i aria-hidden="true"></i></span>`).join("")}</div><div class="ro-linked-documents"><span>${romaniaProjectIcon("document")}<b>${t[5]}</b></span><i aria-hidden="true">+</i><span>${romaniaProjectIcon("documents")}<b>${t[6]}</b></span></div></div><div class="ro-visual-footer ro-visual-result">${romaniaProjectIcon("check")}<span>${t[7]}</span></div>`;
  }else{
    body=`<div class="ro-tbr-flow">${[["document",t[1],t[2]],["tbr",t[3],t[4]],["documents",t[5],t[6]]].map((node,index)=>`${index?'<span class="ro-flow-arrow" aria-hidden="true">→</span>':""}<div class="ro-tbr-node"><span>${romaniaProjectIcon(node[0])}</span><strong>${node[1]}</strong><small>${node[2]}</small></div>`).join("")}</div><div class="ro-tbr-roles"><div>${romaniaProjectIcon("tbr")}<span><strong>${t[7]}</strong><small>${t[8]}</small></span></div><div>${romaniaProjectIcon("user")}<span><strong>${t[9]}</strong><small>${t[10]}</small></span></div></div><div class="ro-visual-footer ro-visual-result">${romaniaProjectIcon("check")}<span>${t[11]}</span></div>`;
  }
  return `<figure class="romania-workflow-visual ro-visual-${type}"><figcaption>${t[0]}</figcaption>${body}</figure>`;
}
function romaniaOtomailMarkup(){
  const total=romaniaOtomailReports.length;
  const t=lang==="tr"?{
    heading:"Romanya için otomatik rapor dağıtımı",
    description:`Ford Otosan Romanya ekiplerine toplam ${total} farklı rapor gönderiyoruz. Otomail, bu raporların e-posta ile paylaşılmasını otomatikleştirerek operasyonel bilgiyi ekiplerle buluşturur.`,
    count:"farklı rapor",reports:"Gönderilen raporlar",flow:"Gönderim akışı",service:"Otomatik e-posta dağıtımı",recipient:"Romanya ekipleri",destination:"Ford Otosan Romanya",note:"Raporlar tek bir otomatik dağıtım akışında ilgili ekiplere ulaştırılır."
  }:{
    heading:"Automatic report delivery for Romania",
    description:`We deliver ${total} different reports to Ford Otosan Romania teams. Otomail automates sharing these reports by email, bringing operational information to the teams.`,
    count:"different reports",reports:"Reports we deliver",flow:"Delivery flow",service:"Automated email distribution",recipient:"Romania teams",destination:"Ford Otosan Romania",note:"Reports reach the relevant teams through one automated distribution flow."
  };
  return `<div class="romania-otomail-layout">
    <section class="ro-mail-header" aria-labelledby="romaniaOtomailHeading">
      <span class="ro-mail-header-icon" aria-hidden="true">${romaniaProjectIcon("mail")}</span>
      <div><h3 id="romaniaOtomailHeading">${t.heading}</h3><p>${t.description}</p></div>
      <div class="ro-mail-total"><strong>${total}</strong><span>${t.count}</span></div>
    </section>
    <div class="ro-mail-workspace">
      <section class="ro-mail-reports" aria-labelledby="romaniaOtomailReportsTitle">
        <h3 id="romaniaOtomailReportsTitle">${t.reports}</h3>
        <div class="ro-mail-report-grid">${romaniaOtomailReports.map(report=>`<article class="ro-mail-report-card"><span class="ro-mail-report-icon" aria-hidden="true">${romaniaProjectIcon(report.icon)}</span><div><h4>${report.title}</h4><p>${report.description[lang]}</p></div></article>`).join("")}</div>
      </section>
      <aside class="ro-mail-delivery" aria-labelledby="romaniaOtomailFlowTitle">
        <h3 id="romaniaOtomailFlowTitle">${t.flow}</h3>
        <div class="ro-mail-files" aria-hidden="true">${romaniaOtomailReports.map((report,index)=>`<span style="--ro-mail-order:${index}">${romaniaProjectIcon("document")}</span>`).join("")}</div>
        <div class="ro-mail-route" aria-hidden="true"></div>
        <div class="ro-mail-service"><span class="ro-mail-orb" aria-hidden="true">${romaniaProjectIcon("mail")}</span><strong>Otomail</strong><span>${t.service}</span></div>
        <div class="ro-mail-route" aria-hidden="true"></div>
        <div class="ro-mail-recipient"><span aria-hidden="true">${romaniaProjectIcon("user")}</span><div><small>${t.recipient}</small><strong>${t.destination}</strong></div></div>
        <p class="ro-mail-delivery-note">${t.note}</p>
      </aside>
    </div>
  </div>`;
}
function renderRomaniaCard(key){
  const button=$(`[data-romania-card="${key}"]`),heading=button?.querySelector("strong"),modal=solutionModals.romania;
  if(!heading||!modal)return;
  const title=$("#romaniaModalTitle"),projects=romaniaProjectData[key]||[];
  title.dataset.tr=heading.dataset.tr||heading.textContent;
  title.dataset.en=heading.dataset.en||heading.textContent;
  title.textContent=title.dataset[lang];
  modal.dataset.romaniaKey=key;
  if(key==="otomail"){$("#romaniaModalBody").innerHTML=romaniaOtomailMarkup();return;}
  const projectMarkup=projects.length?`<div class="romania-project-grid">${projects.map((project,index)=>`<article class="romania-project${key==="aycube"?" romania-aycube-intro":""}${project.visual?` romania-project-designed romania-project-${project.visual}`:""}"><div class="romania-project-copy">${project.visual?`<span class="romania-project-symbol" aria-hidden="true">${romaniaProjectIcon(project.visual)}</span>`:""}<h3>${project.title[lang]}</h3><p>${project.description[lang]}</p>${project.points?.[lang]?.length?`<ul class="romania-project-points">${project.points[lang].map(point=>`<li>${point}</li>`).join("")}</ul>`:""}</div>${project.visual?romaniaProjectVisualMarkup(project.visual):""}${project.image?`<button class="romania-project-screen" type="button" data-romania-image="${index}" aria-label="${project.imageAlt[lang]} — ${lang==="tr"?"ekranı büyüt":"enlarge screen"}"><img src="${project.image}" alt="${project.imageAlt[lang]}" loading="eager" decoding="async" /><span>${lang==="tr"?"Ekranı büyüt":"Enlarge screen"}<b aria-hidden="true">↗</b></span></button>`:""}</article>`).join("")}</div>`:"";
  $("#romaniaModalBody").innerHTML=key==="aycube"?`<div class="romania-aycube-layout">${romaniaAycubeCatalogMarkup()}${projectMarkup}</div>`:projectMarkup;
}
function benefitMarkup(items=[],title=lang==="tr"?"Ford için kazanım":"Benefit for Ford"){
  if(!items.length)return"";
  return `<section class="project-benefits"><span class="project-benefit-icon" aria-hidden="true"><img src="assets/icons/ford-benefit-v1.png" alt="" loading="eager" decoding="async" /></span><div><strong>${title}</strong><ul>${items.map(item=>`<li>${item}</li>`).join("")}</ul></div></section>`;
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
  infoModal.classList.remove("catalog-mode","project-catalog-mode","project-group-mode","supalan-feature-mode","supalan-report-mode");
  delete infoModal.dataset.projectKey;
  $("#modalCode").hidden=false;
  $("#modalBenefits").innerHTML="";
}
function projectItemsMarkup(key){
  return (projectItems[key]||[]).map((item,index)=>{
    const title=item.title[lang];
    const metric=item.metric?`<small>${item.metric[lang]}</small>`:"";
    const media=item.image?`<button class="project-detail-media" type="button" data-project-image="${index}" aria-label="${lang==="tr"?`${title} görselini büyüt`:`Enlarge ${title} image`}"><img src="${item.image}" alt="${title}" loading="eager" decoding="async" /><span>${lang==="tr"?"Görseli büyüt":"Enlarge image"}</span></button>`:"";
    return `
    <article class="project-detail-card${item.image?" has-project-image":""}">
      <button class="project-detail-toggle" type="button" aria-expanded="false">
        <span>${String(index+1).padStart(2,"0")}</span>
        <strong>${title}${metric}</strong>
        <i aria-hidden="true"></i>
      </button>
      <div class="project-detail-body"><div class="project-detail-content">${media}<div class="project-detail-copy"><p>${item.description[lang]}</p>${benefitMarkup(projectBenefits[lang]?.[key]?.[index])}</div></div></div>
    </article>`;
  }).join("");
}
function projectSolutionCardsMarkup(key){
  return (projectItems[key]||[]).map((item,index)=>{
    const title=item.title[lang],number=String(index+1).padStart(2,"0"),detailId=`project-solution-${key}-${index}`;
    const typeLabel=["archive","customs","finance"].includes(key)?"":item.metric?.[lang]||(item.image?(lang==="tr"?"Ekranlı proje":"Project with screen"):(lang==="tr"?"Operasyon projesi":"Operations project"));
    const typeMarkup=typeLabel?`<small>${typeLabel}</small>`:"";
    const media=item.image?`<button class="solution-project-media" type="button" data-solution-image="${index}" aria-label="${lang==="tr"?`${title} görselini büyüt`:`Enlarge ${title} image`}"><img src="${item.image}" alt="${title}" loading="eager" decoding="async" /><span>${lang==="tr"?"Ekranı büyüt":"Enlarge screen"}</span></button>`:"";
    return `<article class="solution-project-card${item.image?" has-screen":""}">
      <button class="solution-project-toggle" type="button" aria-expanded="false" aria-controls="${detailId}">
        <span class="solution-project-index">${number}</span>
        <span class="solution-project-copy"><strong>${title}</strong>${typeMarkup}</span>
        <i aria-hidden="true"></i>
      </button>
      <div class="solution-project-body" id="${detailId}"><div>${media}<div class="solution-project-detail-copy"><p>${item.description[lang]}</p>${benefitMarkup(projectBenefits[lang]?.[key]?.[index])}</div></div></div>
    </article>`;
  }).join("");
}
function renderProjectSolution(key){
  if(!projectSolutionModal||!projectData[lang]?.[key])return;
  const d=projectData[lang][key],items=projectItems[key]||[],panel=$("#projectSolutionPanel"),grid=$("#projectSolutionGrid"),toolbar=$("#projectSolutionToolbar");
  projectSolutionModal.dataset.solutionMode="project";
  projectSolutionModal.dataset.projectKey=key;
  delete projectSolutionModal.dataset.featureScope;
  delete projectSolutionModal.dataset.featureKey;
  panel.classList.remove("theme-customs","theme-finance","theme-archive","theme-supalan","is-empty");
  panel.classList.add(`theme-${key}`);
  panel.classList.toggle("is-empty",items.length===0);
  $("#projectSolutionTitle").textContent=d[1];
  $("#projectSolutionDescription").textContent=d[2];
  const portfolioLabel=$("#projectSolutionPortfolioLabel");
  portfolioLabel.hidden=key==="archive"||key==="customs";
  portfolioLabel.textContent=lang==="tr"?"FORD PROJE PORTFÖYÜ":"FORD PROJECT PORTFOLIO";
  $("#projectSolutionCount").hidden=false;
  $("#projectSolutionCount").textContent=`${items.length} ${lang==="tr"?"proje":"projects"}`;
  $("#projectSolutionHint").textContent=lang==="tr"?"Her kart ayrı bir projedir. Detay ve ekran için kartı açın.":"Each card is a distinct project. Open it for details and its screen.";
  toolbar.hidden=items.length===0;
  grid.hidden=items.length===0;
  grid.classList.remove("is-feature-layout");
  grid.classList.toggle("is-compact",items.length<=3);
  grid.innerHTML=projectSolutionCardsMarkup(key);
}
function featureSolutionScreens(scope,key){
  return scope==="special"?(specialScreens[key]||[]):supalanFeatureGallery(key);
}
function featureSolutionScreenMarkup(items){
  return items.map((item,index)=>{
    const title=item.label?.[lang]||item.title?.[lang]||(lang==="tr"?"Ekran görünümü":"Screen view");
    const detail=item.description?.[lang]||projectScreenDetails[item.src]?.[lang]||"";
    return `<button class="feature-screen-card" type="button" data-feature-screen="${index}" aria-label="${lang==="tr"?`${title} görselini büyüt`:`Enlarge ${title} image`}">
        <span class="feature-screen-media"><img src="${item.src}" alt="${title}" loading="eager" decoding="async" /><i>${lang==="tr"?"Büyüt":"Enlarge"}</i></span>
      <span class="feature-screen-copy"><small>${String(index+1).padStart(2,"0")}</small><strong>${title}</strong>${detail?`<p>${detail}</p>`:""}</span>
    </button>`;
  }).join("");
}
function renderFeatureSolution(scope,key){
  const data=scope==="special"?specialData[lang]?.[key]:supalanFeatureData[lang]?.[key];
  if(!projectSolutionModal||!data)return;
  const screens=featureSolutionScreens(scope,key),points=data[3]||[],panel=$("#projectSolutionPanel"),grid=$("#projectSolutionGrid"),toolbar=$("#projectSolutionToolbar");
  const benefits=scope==="special"?(specialProjectBenefits[lang]?.[key]||[]):[];
  const specialTheme={archiveIndex:"archive",gate:"customs",declarationImage:"finance"};
  const theme=scope==="supalan"?"supalan":specialTheme[key]||"customs";
  projectSolutionModal.dataset.solutionMode="feature";
  projectSolutionModal.dataset.featureScope=scope;
  projectSolutionModal.dataset.featureKey=key;
  delete projectSolutionModal.dataset.projectKey;
  panel.classList.remove("theme-customs","theme-finance","theme-archive","theme-supalan","is-empty");
  panel.classList.add(`theme-${theme}`);
  $("#projectSolutionTitle").textContent=data[1];
  $("#projectSolutionDescription").textContent=data[2];
  const portfolioLabel=$("#projectSolutionPortfolioLabel");
  portfolioLabel.hidden=false;
  portfolioLabel.textContent=scope==="supalan"?(lang==="tr"?"SAHA KONTROL KAPSAMI":"FIELD CONTROL SCOPE"):(lang==="tr"?"ÇÖZÜM KAPSAMI":"SOLUTION SCOPE");
  $("#projectSolutionCount").hidden=true;
  $("#projectSolutionHint").textContent=screens.length?(lang==="tr"?"Ekran kartlarını seçerek büyük görüntüleyebilirsiniz.":"Select a screen card to enlarge it."):(lang==="tr"?"Kontrol adımları tek çözüm görünümünde sunulur.":"Control steps are presented in one solution view.");
  toolbar.hidden=false;
  grid.hidden=false;
  grid.classList.remove("is-compact");
  grid.classList.add("is-feature-layout");
  grid.innerHTML=`${benefitMarkup(benefits)}<div class="feature-solution-layout${screens.length?"":" no-screens"}">
    <section class="feature-solution-block feature-solution-points">
      <header><span>${scope==="supalan"?(lang==="tr"?"OPERASYON KONTROLLERİ":"OPERATIONAL CONTROLS"):(lang==="tr"?"ÇÖZÜM BİLEŞENLERİ":"SOLUTION COMPONENTS")}</span></header>
      <div class="feature-point-grid">${points.map(point=>`<article><i aria-hidden="true"></i><p>${point}</p></article>`).join("")}</div>
    </section>
    ${screens.length?`<section class="feature-solution-block feature-solution-screens"><header><span>${lang==="tr"?"EKRANLAR":"SCREENS"}</span></header><div class="feature-screen-grid">${featureSolutionScreenMarkup(screens)}</div></section>`:""}
  </div>`;
}
// Optional experience handlers own only the motion; native dialogs remain the fallback.
function openPresentationDialog(modal,origin=null,resume=false){
  if(!modal||modal.open)return;
  const request=new CustomEvent("presentation:dialogopen",{detail:{modal,origin,resume},cancelable:true});
  if(!document.dispatchEvent(request))return;
  modal.showModal();
  if(!resume)modal.scrollTop=0;
  if(modal.classList.contains("solution-modal"))requestAnimationFrame(()=>modal.classList.add("is-open"));
}
function closePresentationDialog(modal,immediate=false){
  if(!modal?.open)return;
  const request=new CustomEvent("presentation:dialogclose",{detail:{modal,immediate},cancelable:true});
  if(!document.dispatchEvent(request))return;
  modal.classList.remove("is-open");modal.close();
}
function openFeatureSolution(scope,key){
  renderFeatureSolution(scope,key);
  openPresentationDialog(projectSolutionModal);
}
function openProjectGroup(key){
  const d=projectData[lang][key],items=projectItems[key]||[],screens=projectScreens[key]||[];
  resetInfoModalMode();
  infoModal.classList.add("project-group-mode");
  infoModal.dataset.projectKey=key;
  $("#modalCode").textContent=d[0];
  $("#modalTitle").textContent=d[1];
  $("#modalText").textContent=d[2];
  renderModalGallery(key==="customs"?[]:screens);
  $("#modalPoints").innerHTML=projectItemsMarkup(key);
  const hasProjectContent=items.length>0||screens.length>0;
  const summaryTitle=items.length?`${items.length} ${lang==="tr"?"proje":"projects"}`:`${screens.length} ${lang==="tr"?"ekran örneği":"screen examples"}`;
  $("#modalDemo").innerHTML=hasProjectContent?`<div class="project-group-summary"><strong>${summaryTitle}</strong><span>${lang==="tr"?"Her numara ayrı bir projedir. Kartı açın; ekranlı projelerde görseli ayrıca büyütebilirsiniz.":"Each number is a separate project. Open a card and enlarge the image where a project includes a screen."}</span></div>`:"";
  openPresentationDialog(infoModal);
}
function openSolutionModal(key){
  const modal=solutionModals[key];
  if(!modal)return;
  if(modal===projectSolutionModal)renderProjectSolution(key);
  if(modal.open)return;
  openPresentationDialog(modal);
}
function closeSolutionModal(modal){
  closePresentationDialog(modal);
}
function openInfo(d,galleryItems=[]){resetInfoModalMode();$("#modalCode").textContent=d[0];$("#modalTitle").textContent=d[1];$("#modalText").textContent=d[2];renderModalGallery(galleryItems);$("#modalPoints").innerHTML=d[3].map(p=>`<div>${p}</div>`).join("");$("#modalDemo").innerHTML=demoMarkup(d[4]);openPresentationDialog(infoModal)}
function openRpaInfo(d,galleryItems=[],benefits=[]){
  openInfo(d,galleryItems);
  $("#modalBenefits").innerHTML=benefitMarkup(benefits);
  $("#modalDemo").innerHTML="";
}
function projectCatalogMarkup(groups){
  const total=groups.reduce((sum,group)=>sum+group[1].length,0);
  const projectWord=lang==="tr"?"proje":"projects";
  return `<section class="project-catalog-summary">
    <div><small>${lang==="tr"?"GÜNCEL KAPSAM":"CURRENT SCOPE"}</small><strong>${total}</strong><span>${lang==="tr"?"Ford projesi":"Ford projects"}</span></div>
    <div><small>${lang==="tr"?"YAPI":"STRUCTURE"}</small><strong>${groups.length}</strong><span>${lang==="tr"?"proje grubu":"project groups"}</span></div>
    <p>${lang==="tr"?"Katalog, Sayfa 5’teki beş ana kartın güncel proje içerikleriyle birebir eşleştirilmiştir.":"The catalogue is matched directly to the current project contents of the five main cards on Page 5."}</p>
  </section>
  <div class="project-catalog-groups">${groups.map((group,groupIndex)=>`<section class="catalog-group project-catalog-group">
    <header class="project-catalog-group-head"><div><small>${lang==="tr"?"PROJE GRUBU":"PROJECT GROUP"}</small><h4>${group[0]}</h4></div><strong>${group[1].length}<span>${projectWord}</span></strong></header>
    <div class="catalog-items">${group[1].map((item,index)=>`<div><b>${String(index+1).padStart(2,"0")}</b><span>${item}</span></div>`).join("")}</div>
  </section>`).join("")}</div>`;
}
function openCatalog(title,description,groups,variant="default"){
  resetInfoModalMode();
  infoModal.classList.add("catalog-mode");
  infoModal.classList.toggle("project-catalog-mode",variant==="projects");
  $("#modalCode").hidden=true;$("#modalCode").textContent="";$("#modalTitle").textContent=title;$("#modalText").textContent=description;
  renderModalGallery([]);
  $("#modalPoints").innerHTML=variant==="projects"?projectCatalogMarkup(groups):groups.map(g=>`<section class="catalog-group"><h4>${g[0]} <span>${g[1].length}</span></h4><div class="catalog-items">${g[1].map((item,index)=>`<div><b>${String(index+1).padStart(2,"0")}</b><span>${item}</span></div>`).join("")}</div></section>`).join("");
  $("#modalDemo").innerHTML="";openPresentationDialog(infoModal);
}

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
    customs:["GÜMRÜK & BEKLEME","Vergi Onayı ve Demuraj Görünürlüğü","Gümrüklü araçlarda süreç, gerekli vergi ödemesi ve gümrük adımları tamamlanana kadar bekleme statüsünde izlenir. Giriş, çıkış ve transit sürelerini içeren raporlarımız Ford tarafına zaman ve hareket görünürlüğü sağlar. Demuraj tespiti ve değerlendirmesi, sunduğumuz raporlardaki veriler kullanılarak Ford tarafından yapılır.",["Gümrük statüsü ve vergi ödeme beklemesinin takibi","Giriş, çıkış ve transit zaman damgaları","Bekleyen araçların operasyonel görünürlüğü","Ford ekiplerine düzenli süre ve hareket raporu","Ford’un demuraj değerlendirmesine temel olan güvenilir veri"],"flow"],
    reporting:["GÜVENLİ RAPORLAMA","E-posta Bildirimleri & Rapor Akışı","Aycube’da kaydedilen saha olayları, supalan@aycube.com üzerinden yetkili ekiplere bildirim olarak iletilir. Araç ve şoför detayları olay e-postasında görünür; ithalat ve ihracat kayıtları ayrıca Excel raporlarıyla paylaşılır. Böylece Ford ekipleri saha hareketlerini güncel, izlenebilir ve kanıta dayalı biçimde takip eder.",["Olay bazlı araç ve saha bildirimleri","Supalan ithalat raporunun Excel olarak iletimi","Supalan ihracat raporunun Excel olarak iletimi","Yetkili alıcılarla kontrollü bilgi paylaşımı","E-posta ve raporlar üzerinden izlenebilir operasyon kaydı"],"mail"]
  },
  en:{
    security:["FIELD SECURITY","Security & Entry–Exit Control","Vehicle movements at the Supalan site are monitored through physical checkpoints, plate recognition and an integrated high-security network of 40 cameras. Entry and exit timestamps are recorded, creating an auditable event trail for authorised teams.",["Vehicle-to-record matching through plate recognition","Intensive field monitoring with 40 cameras","Authorised security checks and controlled access","Linking entry–exit timestamps to the Aycube record","Retrospective event visibility when review is required"],"flow"],
    registration:["AYCUBE FIELD RECORD","Truck, Vehicle & Driver Data","The Supalan truck-entry form collects tractor and trailer plates, vehicle type, carrier, driver details, loading point, customs type and the relevant operational location in a single record. The data is retained in Aycube so field teams work from the same current record.",["Tractor and trailer plate data","Vehicle type, make and carrier","Driver name and required contact details","Customs type, status and relevant location","Traceable Aycube record with a unique document number"],"flow"],
    customs:["CUSTOMS & WAITING","Tax Approval and Demurrage Visibility","For customs-controlled vehicles, the process remains in a waiting status until the required tax payment and customs steps are completed. Reports containing entry, exit and transit durations give Ford visibility into time and movement. Ford determines and evaluates demurrage using the data supplied in these reports.",["Tracking customs status and tax-payment waiting","Entry, exit and transit timestamps","Operational visibility for waiting vehicles","Regular duration and movement reports for Ford teams","Reliable data supporting Ford’s demurrage assessment"],"flow"],
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
  openFeatureSolution("supalan",key);
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
if(projectSolutionModal?.open){
  if(projectSolutionModal.dataset.solutionMode==="feature")renderFeatureSolution(projectSolutionModal.dataset.featureScope,projectSolutionModal.dataset.featureKey);
  else if(projectSolutionModal.dataset.projectKey)renderProjectSolution(projectSolutionModal.dataset.projectKey);
}
if(solutionModals.romania?.open)renderRomaniaCard(solutionModals.romania.dataset.romaniaKey);
setSupalanImage(supalanCurrent);refreshDynamicLanguage();
document.dispatchEvent(new CustomEvent("presentation:languagechange"));
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
let lightboxItems=[],lightboxIndex=0,lightboxReturnFocus=null,reopenInfoModalAfterLightbox=false,reopenSolutionModalAfterLightbox=null;

function normalizeLightboxItem(item){
  if(typeof item==="string") return {src:item,title:"Görsel"};
  return {src:item.src,title:item.title || item.alt || item.label?.[lang] || "Görsel"};
}
function openLightbox(items,index=0){
  lightboxItems=(Array.isArray(items)?items:[items]).map(normalizeLightboxItem).filter(x=>x.src);
  if(!lightboxItems.length || !lightbox) return;
  lightboxReturnFocus=document.activeElement;
  reopenInfoModalAfterLightbox=Boolean(infoModal?.open);
  if(reopenInfoModalAfterLightbox) closePresentationDialog(infoModal,true);
  reopenSolutionModalAfterLightbox=Object.values(solutionModals).find(modal=>modal?.open)||null;
  if(reopenSolutionModalAfterLightbox)closePresentationDialog(reopenSolutionModalAfterLightbox,true);
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
  const solutionModalToReopen=reopenSolutionModalAfterLightbox;
  reopenInfoModalAfterLightbox=false;
  reopenSolutionModalAfterLightbox=null;
  setTimeout(()=>{
    if(lightbox.classList.contains("is-open")) return;
    lightboxImage.src="";
    if(solutionModalToReopen&&!solutionModalToReopen.open)openPresentationDialog(solutionModalToReopen,null,true);
    // Restore parent first, then its detail: the last native dialog is on top.
    if(shouldReopenInfoModal && !infoModal.open) openPresentationDialog(infoModal,null,true);
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
  if(target.closest(".logo-stage,.aycube-lockup,.engine-center,.closing-logos,.closing-brand-row,.romania-card-brand")) return null;
  if(target.closest(".romania-project-screen"))return null;

  const projectMedia=target.closest(".project-card-media");
  if(projectMedia) return null;

  const specialVisual=target.closest(".screenshot-visual");
  if(specialVisual){
    const card=specialVisual.closest(".special-card"),img=specialVisual.querySelector("img");
    if(card?.getAttribute("aria-controls")==="projectSolutionModal")return null;
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
$$("[data-team-card]").forEach(card=>card.addEventListener("click",()=>{const open=!card.classList.contains("is-open");$$("[data-team-card]").forEach(x=>{x.classList.remove("is-open");x.setAttribute("aria-expanded","false")});if(open){card.classList.add("is-open");card.setAttribute("aria-expanded","true")}}));
$$(".engine-node").forEach(b=>b.addEventListener("click",()=>togglePartnership(b)));
$("#partnershipClose")?.addEventListener("click",closePartnership);
$$(".project-card").forEach(b=>b.addEventListener("click",()=>{
  const key=b.dataset.project;
  if(solutionModals[key])openSolutionModal(key);
  else openProjectGroup(key);
}));
$$("[data-romania-card]").forEach(button=>button.addEventListener("click",()=>{
  renderRomaniaCard(button.dataset.romaniaCard);
  openSolutionModal("romania");
  solutionModals.romania.querySelector("[data-solution-close]").focus({preventScroll:true});
  solutionModals.romania.querySelector(".solution-panel").scrollTop=0;
}));
$("#romaniaModalBody").addEventListener("click",event=>{
  const screen=event.target.closest("[data-romania-image]");
  if(!screen)return;
  const project=romaniaProjectData[solutionModals.romania.dataset.romaniaKey]?.[Number(screen.dataset.romaniaImage)];
  if(project?.image)openLightbox([{src:project.image,title:project.imageAlt[lang]}],0);
});
$("#projectSolutionGrid")?.addEventListener("click",event=>{
  const featureScreen=event.target.closest(".feature-screen-card");
  if(featureScreen){
    const scope=projectSolutionModal.dataset.featureScope,key=projectSolutionModal.dataset.featureKey,screens=featureSolutionScreens(scope,key);
    const images=screens.map(item=>({src:item.src,title:item.label?.[lang]||item.title?.[lang]||(lang==="tr"?"Ekran görünümü":"Screen view")}));
    openLightbox(images,Number(featureScreen.dataset.featureScreen)||0);
    return;
  }
  const media=event.target.closest(".solution-project-media");
  if(media){
    const key=projectSolutionModal.dataset.projectKey,index=Number(media.dataset.solutionImage),items=projectItems[key]||[],selected=items[index];
    if(selected?.image){
      const images=items.filter(item=>item.image).map(item=>({src:item.image,title:item.title[lang]}));
      openLightbox(images,Math.max(0,images.findIndex(item=>item.src===selected.image)));
    }
    return;
  }
  const toggle=event.target.closest(".solution-project-toggle");
  if(!toggle)return;
  const card=toggle.closest(".solution-project-card"),willOpen=!card.classList.contains("is-open"),grid=$("#projectSolutionGrid");
  grid.querySelectorAll(".solution-project-card").forEach(item=>{item.classList.remove("is-open");item.querySelector(".solution-project-toggle")?.setAttribute("aria-expanded","false")});
  if(willOpen){card.classList.add("is-open");toggle.setAttribute("aria-expanded","true")}
});
$("#allProjectsBtn").addEventListener("click",()=>{
  const groups=projectCatalog[lang],total=groups.reduce((sum,group)=>sum+group[1].length,0);
  openCatalog(lang==="tr"?"Ford Otosan Proje Kataloğu":"Ford Otosan Project Catalogue",lang==="tr"?`Sayfa 5’teki kartlarda yer alan ${total} proje, güncel çözüm gruplarına göre bir araya getirilmiştir.`:`The ${total} projects shown in the Page 5 cards are organised by their current solution groups.`,groups,"projects");
});
$$(".integration-tab").forEach(b=>b.addEventListener("click",()=>{$$(".integration-tab").forEach(x=>x.classList.remove("is-active"));b.classList.add("is-active");renderIntegration(b.dataset.integrationTab)}));
$$(".special-card").forEach(b=>b.addEventListener("click",()=>openFeatureSolution("special",b.dataset.special)));
$$("[data-rpa-project]").forEach(b=>b.addEventListener("click",()=>{
  const key=b.dataset.rpaProject;
  openRpaInfo(rpaProjectData[lang][key],rpaProjectScreens[key]||[],rpaProjectBenefits[lang]?.[key]||[]);
}));
$$("[data-solution-close]").forEach(button=>button.addEventListener("click",()=>closeSolutionModal(button.closest(".solution-modal"))));
$$(".solution-modal").forEach(modal=>{
  modal.addEventListener("click",event=>{if(event.target===modal)closeSolutionModal(modal)});
  modal.addEventListener("close",()=>modal.classList.remove("is-open"));
});
$$("[data-supalan-feature]").forEach(b=>b.addEventListener("click",()=>openSupalanFeature(b.dataset.supalanFeature)));
$$("[data-copy-email]").forEach(button=>button.addEventListener("click",()=>copyTeamEmail(button)));
startSupalanAutoplay();
startSupalanTruckFlow();
runOtomailFlow();
runRobotFlow();

$("#allReportsBtn").addEventListener("click",()=>openCatalog(lang==="tr"?"Ford Otomail Rapor Kataloğu":"Ford Otomail Report Catalogue",lang==="tr"?"37 rapor kaydı konu başlıklarına göre gruplanmıştır. Otomail akışında raporlar güvenli biçimde üretilir, doğrulanır ve yalnızca yetkili Ford Otosan alıcılarına iletilir.":"The 37 report entries are grouped by subject. In the Otomail flow, reports are securely generated, validated and delivered only to authorised Ford Otosan recipients.",reportCatalog[lang]));

$("#intacDetailBtn").addEventListener("click",()=>openRpaInfo(lang==="tr"?["FORD İNTAÇ PROJESİ","Ford İNTAÇ Sorgulama","Robotun portal oturumu açması, sorgu parametrelerini girmesi, sonucu alması ve sonraki sisteme kontrollü biçimde aktarması.",["Tekrarlı portal adımlarının otomasyonu","Sorgu sonuçlarının loglanması","Hata ve istisna durumlarının işaretlenmesi","Aycube ve ilgili sistemlere aktarım"],"flow"]:["INTAÇ AUTOMATION","Ford INTAÇ Query","The robot opens the portal session, enters query parameters, retrieves the result and transfers it to the next system in a controlled flow.",["Automation of repetitive portal steps","Query-result logging","Error and exception marking","Transfer to Aycube and related systems"],"flow"],projectScreens.intac,rpaProjectBenefits[lang].intac));

$("#modalClose").addEventListener("click",()=>closePresentationDialog(infoModal));infoModal.addEventListener("click",e=>{if(e.target===infoModal)closePresentationDialog(infoModal)});
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
  const imageButton=event.target.closest(".project-detail-media");
  if(imageButton){
    const key=infoModal.dataset.projectKey,index=Number(imageButton.dataset.projectImage),items=projectItems[key]||[],item=items[index];
    if(item?.image){
      const imageItems=items.filter(project=>project.image).map(project=>({src:project.image,title:project.title[lang]}));
      openLightbox(imageItems,Math.max(0,imageItems.findIndex(project=>project.src===item.image)));
    }
    return;
  }
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
  const activeSolutionModal=document.querySelector("dialog[open]");
  if(activeSolutionModal){
    if(e.key==="Escape"){e.preventDefault();closeSolutionModal(activeSolutionModal)}
    return;
  }
  if(["ArrowRight","PageDown"," "].includes(e.key)){e.preventDefault();navigate(current+1)}
  if(["ArrowLeft","PageUp"].includes(e.key)){e.preventDefault();navigate(current-1)}
  if(e.key.toLowerCase()==="f")document.fullscreenElement?document.exitFullscreen?.():document.documentElement.requestFullscreen?.();
  if(e.key.toLowerCase()==="o")overview.classList.add("is-open");
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
  if(document.querySelector("dialog[open]"))return;
  d<0?navigate(current+1):navigate(current-1);
},{passive:true});
document.addEventListener("mousemove",e=>{$("#cursorAura").style.left=`${e.clientX}px`;$("#cursorAura").style.top=`${e.clientY}px`});
bindImageOpeners();
$("#robotStatus").dataset.state="ready";
$$(".report-row").forEach(row=>setReportState(row,row.dataset.state||"queued"));
$$(".truck-row").forEach(updateTruckRowLanguage);
const requestedSlide=Number(new URLSearchParams(location.search).get("slide")||1)-1;
buildOverview();commitSlide(Number.isFinite(requestedSlide)?requestedSlide:0);updateLanguage();scheduleAdjacentWarmup(current);
