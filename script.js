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
collaboration:["01 / İŞ BİRLİĞİ","İş birimleriyle aynı masada","İhtiyaçlar doğrudan operasyon ekiplerinden alınır; geri bildirim, analiz, geliştirme ve teslimat döngüsü birlikte yürütülür."],
feedback:["02 / İTERASYON","Hızlı geri bildirim, kısa geliştirme döngüsü","Kullanıcı geri bildirimleri hızla değerlendirilir; küçük ve kontrollü sürümlerle kesintisiz iyileştirme sağlanır."],
architecture:["03 / MİMARİ","Güvenli ve sürdürülebilir mimari","Veri akışları rol bazlı yetki, izlenebilir kayıt ve genişleyebilir entegrasyon yaklaşımıyla tasarlanır."],
visibility:["04 / GÖRÜNÜRLÜK","Operasyonun tamamı görünür","Raporlama ve otomasyon katmanlarıyla süreç durumu, hata noktaları ve aksiyonlar ölçülebilir hâle gelir."]},
en:{
collaboration:["01 / COLLABORATION","At the same table with business units","Needs are gathered directly from operational teams; feedback, analysis, development and delivery are managed together."],
feedback:["02 / ITERATION","Fast feedback and short development cycles","User feedback is evaluated rapidly and continuous improvement is delivered through small controlled releases."],
architecture:["03 / ARCHITECTURE","Secure and sustainable architecture","Data flows are designed with role-based access, traceable records and an expandable integration approach."],
visibility:["04 / VISIBILITY","Full operational visibility","Reporting and automation layers make process status, error points and actions measurable."]}};

const projectData={
tr:{
customs:["CUSTOMS & TRACKING","Gümrük ve Takip Projeleri","Ford operasyonlarında beyan, evrak, süre ve geçici rejim risklerini tek platformda kontrol altına alan yönetim katmanı.",["Geçici ithalat","Toplu Evrak","Özet Beyan Takip","Geçici İthalat / İhracat Takibi","Özet beyan süresi yaklaştığında uyarı gelmesi","GetApp"],"flow"],
integration:["INTEGRATION & DATA","Entegrasyon ve Veri Projeleri","Kaynak sistem verisini Ford operasyon kurallarıyla birleştirip manuel girişleri azaltan, veri kalitesini yükselten entegrasyon omurgası.",["Ford Entegrasyon","Toplu İntaç Sorgulama (intaç tarihi entegrasyonla gitmesi)","intaç tarihi toplu sorgulama","Gtip Güncelleme","İhracatta Oto. Getirilen bazı alanlar","İhracat Sisteminde vergi alanı dolu ise tescil sonrası bilgi girişine oto. gelmesi","Saymanlık Bilgisi"],"flow"],
automation:["RPA & OCR","RPA ve OCR Projeleri","Tekrarlı portal ve belge işlerini robotlaştırarak operasyon ekiplerine hız, standart ve hata kontrolü kazandıran otomasyon katmanı.",["Tareks","tareks işlemlerinin rpa üzerinde yapılması","Ford Fatura OCR","Ford Faturalarında 0910 Tekrarlanmasının Önlenmesi","Otomatik Fatura Ekranına Ford Firmalarının Dosyalarının Gelmesi"],"flow"],
finance:["FINANCE & COMMISSION","Finans ve Komisyon Projeleri","Vergi, para, dekont, ekstre ve komisyon akışlarında finansal görünürlük ve denetlenebilir kontrol sağlayan çözüm paketi.",["Bankaya gönderilen Byn. Görüntüsü","Müşteri komisyonları","Dekont Edilmeyen Dosyaların tespiti","Ekstre gönderimi otomatize edilmesi","Vergi Talep","Para Talep","komisyon hesaplama","öz-3 işaretlemerinde komisyon işaretlemeleri kontrolü"],"flow"],
archive:["ARCHIVE & DOCUMENT","Arşiv ve Doküman Projeleri","Ford evrak hafızasını standartlaştıran, arama süresini kısaltan ve denetim gücünü artıran doküman omurgası.",["Ford Arşiv Entegrasyon","arşiv fihrist","Ford Gtip Raporu"],"search"]},
en:{
customs:["CUSTOMS & TRACKING","Customs and Tracking Projects","An executive control layer for declaration, document, deadline and temporary-regime risks across Ford operations.",["Temporary import","Bulk Documents","Summary Declaration Tracking","Temporary Import / Export Tracking","Summary-declaration deadline warning","GetApp"],"flow"],
integration:["INTEGRATION & DATA","Integration and Data Projects","An integration backbone that combines source-system data with Ford-specific rules, reducing manual entry and improving data quality.",["Ford Integration","Bulk INTAÇ Query with date integration","Bulk INTAÇ date query","GTIP Update","Automatically populated export fields","Automatic post-registration tax-field entry","Accounting Office Information"],"flow"],
automation:["RPA & OCR","RPA and OCR Projects","An automation layer that robotizes repetitive portal and document tasks, giving teams speed, standards and error control.",["TAREKS","TAREKS operations through RPA","Ford Invoice OCR","Prevention of repeated 0910 on Ford invoices","Automatic arrival of Ford company files on the invoice screen"],"flow"],
finance:["FINANCE & COMMISSION","Finance and Commission Projects","A solution suite that provides financial visibility and auditable control across tax, cash, receipt, statement and commission flows.",["Declaration image sent to the bank","Customer commissions","Detection of files without receipts","Automated statement delivery","Tax Request","Cash Request","Commission calculation","Commission-marking control for ÖZ-3"],"flow"],
archive:["ARCHIVE & DOCUMENT","Archive and Document Projects","A document backbone that standardizes Ford’s document memory, reduces search time and strengthens audit readiness.",["Ford Archive Integration","Archive Index","Ford GTIP Report"],"search"]}};

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

const integrationData={
tr:{
import:{code:"IMPORT INTEGRATION",title:"İthalat Entegrasyonu",description:"Ford Entegrasyon kapsamında araç ve yedek parça ithalatı; farklı veri alanları, saymanlık bilgisi, GTİP kuralları, bütçeler ve geliştirme süreçleri nedeniyle ayrı akışlarda yönetilir.",rate:96.4,rateText:"%96,4",cards:[["01 / VEHICLE","İthalat Araç","Araç operasyonuna özel veri modeli, doğrulama alanları, saymanlık bilgisi ve beyanname senaryoları."],["02 / SPARE PARTS","İthalat Yedek Parça","Yedek parça kalemleri, GTİP güncelleme, alan seçimi ve kontrol ihtiyaçları."]]},
export:{code:"EXPORT INTEGRATION",title:"İhracat Entegrasyonu",description:"Araç ve yedek parça ihracatı; otomatik getirilen alanlar, vergi alanının tescil sonrası aktarımı, sevkiyat ve beyanname ihtiyaçları nedeniyle ayrı akışlarda ele alınır.",rate:94.8,rateText:"%94,8",cards:[["01 / VEHICLE","İhracat Araç","Araç ihracatına özel sevkiyat, beyanname ve otomatik alan akışı."],["02 / SPARE PARTS","İhracat Yedek Parça","Kalem bazlı veri, vergi alanı ve doğrulama ihtiyaçlarına özel akış."]]},
archive:{code:"ARCHIVE INTEGRATION",title:"Arşiv Entegrasyonu",description:"Ford Arşiv Entegrasyon ve Arşiv Fihrist ile evrakları tek havuzda, standart metaveri ve olay bazlı arşivleme yaklaşımıyla yönetir.",rate:100,rateText:"%100",cards:[["01 / INDEX","Hızlı Erişim","Anahtar alanlarla saniyeler içinde arama, görüntüleme ve kayıt ilişkilendirme."],["02 / AUDIT","Versiyon & Audit Trail","Tek doğru kayıt, versiyon geçmişi ve denetlenebilir işlem izi."]]},
bank:{code:"BANK INTEGRATION",title:"Banka Entegrasyonu",description:"Bankaya gönderilen beyanname görüntüsü, dekont edilmeyen dosyaların tespiti ve ekstre gönderimi süreçlerini standart, kontrollü ve izlenebilir hâle getirir.",rate:99.2,rateText:"%99,2",cards:[["01 / TRANSFER","Kontrollü İletim","Bankaya gönderilen beyanname görüntüsünün kontrollü alınması ve iletilmesi."],["02 / CONTROL","Mutabakat & İstisna","Dekont edilmeyen dosyaların tespiti, otomatik ekstre ve hata durumlarının izlenmesi."]]}},
en:{
import:{code:"IMPORT INTEGRATION",title:"Import Integration",description:"Vehicle and spare-part operations are managed as separate flows because of different data fields, validation rules, budgets and delivery cycles.",rate:96.4,rateText:"96.4%",cards:[["01 / VEHICLE","Vehicle Import","Vehicle-specific data model, validation fields and declaration scenarios."],["02 / SPARE PARTS","Spare-Part Import","Line-item, field and validation needs specific to spare-part operations."]]},
export:{code:"EXPORT INTEGRATION",title:"Export Integration",description:"Vehicle and spare-part exports are handled separately because shipment, declaration, document and data-standardization needs differ.",rate:94.8,rateText:"94.8%",cards:[["01 / VEHICLE","Vehicle Export","Vehicle-specific shipment, declaration and validation flow."],["02 / SPARE PARTS","Spare-Part Export","A flow tailored to line-level data, documents and validation needs."]]},
archive:{code:"ARCHIVE INTEGRATION",title:"Archive Integration",description:"Manages documents in one pool with standard metadata and event-based archiving.",rate:100,rateText:"100%",cards:[["01 / INDEX","Fast Access","Search and view within seconds using key fields."],["02 / AUDIT","Version & Audit Trail","Single source of truth, version history and auditable records."]]},
bank:{code:"BANK INTEGRATION",title:"Bank Integration",description:"Makes payments, collections, receipts and declaration-image flows standard, controlled and traceable.",rate:99.2,rateText:"99.2%",cards:[["01 / TRANSFER","Controlled Delivery","Automatic recorded delivery of declaration images to the bank."],["02 / CONTROL","Reconciliation & Exception","Monitoring successful, pending and failed states."]]}}};

const projectCatalog={
tr:[["Gümrük & Takip",["Geçici ithalat","Toplu Evrak","Özet Beyan Takip","GetApp","Geçici İthalat / İhracat Takibi","Özet beyan süresi yaklaştığında uyarı gelmesi"]],["Entegrasyon & Veri",["Toplu İntaç Sorgulama (intaç tarihi entegrasyonla gitmesi)","intaç tarihi toplu sorgulama","Gtip Güncelleme","İhracatta Oto. Getirilen bazı alanlar","Ford Entegrasyon","Saymanlık Bilgisi","İhracat Sisteminde vergi alanı dolu ise tescil sonrası bilgi girişine oto. gelmesi"]],["RPA & OCR",["Tareks","tareks işlemlerinin rpa üzerinde yapılması","Ford Fatura OCR","Ford Faturalarında 0910 Tekrarlanmasının Önlenmesi","Otomatik Fatura Ekranına Ford Firmalarının Dosyalarının Gelmesi"]],["Finans & Komisyon",["Bankaya gönderilen Byn. Görüntüsü","Müşteri komisyonları","Dekont Edilmeyen Dosyaların tespiti","Ekstre gönderimi otomatize edilmesi","Vergi Talep","Para Talep","komisyon hesaplama","öz-3 işaretlemerinde komisyon işaretlemeleri kontrolü"]],["Arşiv & Rapor",["Ford Gtip Raporu","Ford Arşiv Entegrasyon","arşiv fihrist"]]],
en:[["Customs & Tracking",["Temporary import","Bulk Documents","Summary Declaration Tracking","GetApp","Temporary Import / Export Tracking","Summary-declaration deadline warning"]],["Integration & Data",["Bulk INTAÇ Query with date integration","Bulk INTAÇ date query","GTIP Update","Automatically populated export fields","Ford Integration","Accounting Office Information","Automatic post-registration tax-field entry"]],["RPA & OCR",["TAREKS","TAREKS operations through RPA","Ford Invoice OCR","Prevention of repeated 0910 on Ford invoices","Automatic arrival of Ford company files on invoice screen"]],["Finance & Commission",["Declaration image sent to bank","Customer commissions","Detection of files without receipts","Automated statement delivery","Tax Request","Cash Request","Commission calculation","Commission-marking control for ÖZ-3"]],["Archive & Reporting",["Ford GTIP Report","Ford Archive Integration","Archive Index"]]]};
const reportCatalog={
tr:[["İthalat & Beyanname",["Ford Eksik evrak raporu haftalık","ford eksik evrak raporu","Detaylı ithalat raporları","Ford beyanname raporu","ford serbest dolaşıma giriş listesi YP","ford ithalat raporu","ford ithalat","ford istatistiki kıymet","ford ötv mail","ford navlun mail","ford imei mail","ikileme"]],["İhracat",["ford ihracat gtip bazlı rapor","ford ihracat raporu (0100)","Ford İhracat Raporu 0100-cargo","Ford İhracat","Ford parça ihracat raporu","Ford geçici ihracat","Ford intaç mail","Ford Günlük Araç İhracat","Ford ihracat ceza","ford sandık","ford vw ihracat","ford araç ihracat"]],["Finans & Ödeme",["ford dekont raporu","Ford Ödeme Raporu","ford samandıra dekont","aygen ford ödeme listesi"]],["Uyum & Teşvik",["ceza takip raporu (ford)","ford ar-ge raporu","ford yatırım teşvik raporu","ford nihai kullanım raporu","ford ihracat gtip bazlı rapor"]],["Saha & Arşiv",["gümrüklü saha listesi","gümrüklü saha listesi ford dışı antrepo","yp kapı bildirim","arşiv kontrol ford mail"]]],
en:[["Import & Declaration",["Weekly Ford missing-document report","Ford missing-document report","Detailed import reports","Ford declaration report","Ford free-circulation entry list — spare parts","Ford import report","Ford import","Ford statistical value","Ford SCT mail","Ford freight mail","Ford IMEI mail","Duplication control"]],["Export",["Ford export report by GTIP","Ford export report (0100)","Ford Export Report 0100-cargo","Ford Export","Ford spare-parts export report","Ford temporary export","Ford INTAÇ mail","Ford Daily Vehicle Export","Ford export penalty","Ford crate","Ford VW export","Ford vehicle export"]],["Finance & Payment",["Ford receipt report","Ford Payment Report","Ford Samandıra receipt","Aygen Ford payment list"]],["Compliance & Incentives",["Ford penalty tracking report","Ford R&D report","Ford investment-incentive report","Ford end-use report","Ford export report by GTIP"]],["Field & Archive",["Customs field list","Customs field list — non-Ford warehouse","Spare-parts gate notification","Ford archive-control mail"]]]};

const specialData={
tr:{
archiveIndex:["ARCHIVE INDEX","Arşiv Fihrist","Belgeye tarih, referans, süreç ve tip bazlı arama; saniyeler içinde bulma, görüntüleme ve ilgili kayıtla ilişkilendirme.",["Tekil doküman kimliği","Tutarlı metaveri alanları","Versiyon ve işlem geçmişi","Rol bazlı erişim"],"search"],
gate:["GATE NOTIFICATIONS","Kapı Bildirimleri","Tır, araç ve ziyaretçi giriş-çıkışlarının tek ekranda izlenmesi; anlık kayıt, geriye dönük sorgu ve yetkili onay akışı.",["Manuel form ihtiyacını azaltır","Hatalı veya eksik girişleri minimize eder","Olay inceleme süresini kısaltır","Vardiya ve saha ekipleri için standart akış"],"flow"],
declarationImage:["DECLARATION IMAGE","Bankaya Gönderilen Beyanname Görüntüsü","Tescil beyanname görüntüsünün kontrollü şekilde alınması, bankaya iletilmesi ve gönderim kayıtlarının izlenmesi.",["Manuel e-posta ve ek yönetimini azaltır","Gönderim zamanı ve alıcı logları","Tekrar deneme ve hata uyarısı","Ödeme ve teminat akışlarıyla bağlantı"],"flow"]},
en:{
archiveIndex:["ARCHIVE INDEX","Archive Index","Search by date, reference, process and type; find, view and link documents to the relevant record within seconds.",["Unique document identity","Consistent metadata","Version and activity history","Role-based access"],"search"],
gate:["GATE NOTIFICATIONS","Gate Notifications","Truck, vehicle and visitor entry-exit tracking on one screen with real-time records, historical search and authorized approval.",["Reduces manual forms","Minimizes incomplete entries","Shortens incident-review time","Standard flow for shift and field teams"],"flow"],
declarationImage:["DECLARATION IMAGE","Declaration Image Sent to Bank","Controlled retrieval, bank delivery and tracking of registered declaration images.",["Reduces manual email and attachment handling","Delivery time and recipient logs","Retry and error alerts","Connection to payment and guarantee flows"],"flow"]}};

const specialScreens={
  archiveIndex:[
    {src:"assets/aycube_screens/arsiv-fihrist.png",label:{tr:"Arşiv Fihrist",en:"Archive Index"}},
    {src:"assets/aycube_screens/arsiv-dosya-yukleme.png",label:{tr:"Dosya Yükleme ve Belge Eşleştirme",en:"File Upload and Document Matching"}}
  ],
  gate:[
    {src:"assets/aycube_screens/supalan-liste.png",label:{tr:"Supalan Liste",en:"Supalan List"}},
    {src:"assets/aycube_screens/supalan-giris-formu.png",label:{tr:"Supalan Giriş Formu",en:"Supalan Entry Form"}}
  ],
  declarationImage:[
    {src:"assets/aycube_screens/arsiv-dosya-yukleme.png",label:{tr:"Beyanname Görüntüsü Dosya Akışı",en:"Declaration Image File Flow"}},
    {src:"assets/aycube_screens/arsiv-fihrist.png",label:{tr:"Arşiv Kayıt Eşleşmesi",en:"Archive Record Match"}}
  ]
};

const speakerScripts={
tr:[
"Açılış mesajı tek: Aygen IT; entegrasyon, otomasyon, raporlama ve saha görünürlüğünü Ford operasyonları için tek dijital omurgada birleştiriyor. 29 proje ve 37 rapor akışı, dağınık çözümler değil, aynı ölçeklenebilir ekosistemin parçalarıdır.",
"Hikâyeyi dört eksende kuruyoruz: net sahiplik, tek platform, otomasyonla güçlenen karar ritmi ve sahada görünür etki. Her eksen, bir sonrakinin zeminini hazırlıyor.",
"Bu bölüm teknolojiyi kimin taşıdığını gösteriyor. Beş farklı uzmanlık aynı teslimat sorumluluğunda birleşiyor: liderlik, yazılım, analiz, RPA ve yapay zekâ. Kartları açarak her ekip üyesinin ana katkısını vurgulayabilirsiniz.",
"İş birliği modelimizin farkı ortak ritimdir. İhtiyaç, analiz, geliştirme ve geri bildirim aynı döngüde ilerler; böylece karar süresi kısalır, sahiplik netleşir ve öğrenilenler sürdürülebilir mimariye dönüşür.",
"Aycube bölümünde ana mesaj tek platform mantığı. Ford için geliştirilen 29 proje; gümrük takip, entegrasyon, otomasyon, finans ve arşiv başlıklarında toplanıyor. Kartlara tıklandığında gerçek ekranlar ve proje detayları açılıyor.",
"Otomail slaytında ana fikir 37 raporun tek teslim ritminde yönetilmesi. Planlama, üretim, doğrulama ve dağıtım adımları görünür hale gelir; ekipler rapor peşinde koşmak yerine istisnalara odaklanır.",
"Dört kritik entegrasyon alanı aynı veri prensipleri üzerinde çalışıyor: ortak veri, kural bazlı doğrulama ve izlenebilir teslimat. Yüzde yerine kapsamı gösteriyoruz; böylece doğrulanmamış KPI’larla güven zedelemiyoruz.",
"RPA ve OCR bölümünde insan–robot iş bölümünü anlatıyoruz. Robot tekrarlı portal adımlarını yürütür, OCR belge verisini doğrular, ekip ise istisnaları ve karar gerektiren durumları yönetir.",
"Özel projelerde sahadaki somut ihtiyaçlara üretilen nokta çözümleri gösteriyoruz: arşiv fihrist, kapı bildirimleri ve bankaya giden beyanname görüntüleri. Mesaj şu: ihtiyaç netse çözüm hızlı ve kontrollü üretiliyor.",
"Supalan bölümünde gerçek saha ve dijital yönetim aynı karede. Drone görselleri operasyon alanını gösteriyor; Aycube web ekranları ise tır giriş, kayıt ve bekleme süreçlerinin izlenebilir hale geldiğini anlatıyor. Ekrandaki sayısal veriler örnektir.",
"Kapanış, veriyle görünür hale gelen operasyonun artık somut aksiyona dönüşebileceğini vurguluyor. Aygen IT ve Ford Otosan iş birliğini, geleceği birlikte şekillendiren uzun vadeli bir ortaklık mesajıyla tamamlıyoruz."
],
en:[
"The opening message is simple: Aygen IT unifies integration, automation, reporting and field visibility into one digital backbone for Ford operations. The 29 projects and 37 report flows are parts of the same scalable ecosystem.",
"The story follows four pillars: clear ownership, one platform, an automation-powered decision rhythm and visible field impact. Each pillar creates the foundation for the next.",
"This section shows who carries the work. Five disciplines share one delivery responsibility: leadership, software, analysis, RPA and AI. Open the cards to highlight each person’s core contribution.",
"The differentiator is a shared operating rhythm. Needs, analysis, development and feedback move in one cycle, shortening decisions, clarifying ownership and turning learning into sustainable architecture.",
"The Aycube section communicates the single-platform logic. The 29 Ford projects are grouped under customs tracking, integration, automation, finance and archive capabilities. Each card opens real screens and project details.",
"The Otomail message is that 37 reports run through one delivery rhythm. Scheduling, production, validation and distribution become visible, allowing teams to focus on exceptions instead of chasing reports.",
"Four critical integration areas share the same principles: common data, rule-based validation and traceable delivery. The slide shows scope instead of unverified percentages, preserving executive credibility.",
"The RPA and OCR slide explains the human–robot split. Robots execute repetitive portal steps, OCR validates document data and the team manages exceptions and decision-heavy cases.",
"Special projects show targeted solutions for concrete operational needs: archive index, gate notifications and declaration images sent to the bank. The message is clear: when the need is defined, the solution is delivered quickly and in a controlled way.",
"The Supalan section brings real field operations and digital management together. Drone visuals show the physical field, while the Aycube web screens show how truck entry, records and waiting flows become traceable. The figures shown are illustrative.",
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
function renderPartnership(key){
const d=partnershipData[lang][key],panel=$("#partnershipDetail");
panel.innerHTML=`<span>${d[0]}</span><h3>${d[1]}</h3><p>${d[2]}</p>`;
panel.animate([{opacity:0,transform:"translateY(12px)"},{opacity:1,transform:"translateY(0)"}],{duration:420,easing:"cubic-bezier(.22,1,.36,1)"});
}
function renderIntegration(key){
const d=integrationData[lang][key];
$("#integrationCode").textContent=d.code;$("#integrationTitle").textContent=d.title;$("#integrationDescription").textContent=d.description;
$("#flowColumns").innerHTML=d.cards.map(c=>`<article class="flow-card"><span>${c[0]}</span><h4>${c[1]}</h4><p>${c[2]}</p></article>`).join("");
$(".integration-stage").animate([{opacity:.45,transform:"translateY(10px)"},{opacity:1,transform:"translateY(0)"}],{duration:420,easing:"cubic-bezier(.22,1,.36,1)"});
}
function demoMarkup(type){
if(type==="search")return`<div class="demo-search"><span>${lang==="tr"?"FORD / 2026 / Beyanname / Referans...":"FORD / 2026 / Declaration / Reference..."}</span><b>${lang==="tr"?"0,4 sn":"0.4 sec"}</b></div>`;
if(type==="mail")return`<div class="demo-flow"><div>${lang==="tr"?"Rapor Üret":"Generate"}</div><div>${lang==="tr"?"Doğrula":"Validate"}</div><div>${lang==="tr"?"Dağıt":"Deliver"}</div></div>`;
return`<div class="demo-flow"><div>${lang==="tr"?"Veri Al":"Receive Data"}</div><div>${lang==="tr"?"Kontrol Et":"Validate"}</div><div>${lang==="tr"?"İzle & Raporla":"Track & Report"}</div></div>`;
}
function renderModalGallery(items=[]){
  const gallery=$("#modalGallery");
  if(!gallery) return;
  if(!items.length){gallery.innerHTML="";gallery.classList.remove("has-gallery");return;}
  const [hero,...rest]=items;
  gallery.classList.add("has-gallery");
  gallery.innerHTML=`<figure class="modal-gallery-hero"><img src="${hero.src}" alt="${hero.label[lang]}" /><figcaption><strong>${hero.label[lang]}</strong><small>${lang==="tr"?"Gerçek Aycube ekranı":"Real Aycube screen"}</small></figcaption></figure>${rest.length?`<div class="modal-gallery-strip">${rest.map(item=>`<figure class="modal-gallery-thumb"><img src="${item.src}" alt="${item.label[lang]}" /><figcaption>${item.label[lang]}</figcaption></figure>`).join("")}</div>`:""}`;
}
function openInfo(d,galleryItems=[]){infoModal.classList.remove("catalog-mode");$("#modalCode").textContent=d[0];$("#modalTitle").textContent=d[1];$("#modalText").textContent=d[2];renderModalGallery(galleryItems);$("#modalPoints").innerHTML=d[3].map(p=>`<div>${p}</div>`).join("");$("#modalDemo").innerHTML=demoMarkup(d[4]);infoModal.showModal()}
function openCatalog(code,title,description,groups){infoModal.classList.add("catalog-mode");$("#modalCode").textContent=code;$("#modalTitle").textContent=title;$("#modalText").textContent=description;renderModalGallery([]);$("#modalPoints").innerHTML=groups.map(g=>`<section class="catalog-group"><h4>${g[0]} <span>${g[1].length}</span></h4><div class="catalog-items">${g[1].map((item,index)=>`<div><b>${String(index+1).padStart(2,"0")}</b><span>${item}</span></div>`).join("")}</div></section>`).join("");$("#modalDemo").innerHTML="";infoModal.showModal()}

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
    otomailReady:"Akış hazır",otomailRunning:"Akış çalışıyor",otomailComplete:"Tüm raporlar gönderildi",runAgain:"Akışı Yeniden Çalıştır",runFlow:"Akışı Çalıştır",
    robotReady:"Hazır",robotRunning:"Çalışıyor",robotComplete:"Tamamlandı",robotRun:"Robot Akışını Çalıştır",robotAgain:"Akışı Yeniden Çalıştır",
    registered:"Giriş kaydı",waiting:"Bekliyor",processing:"İşlemde",complete:"Tamamlandı",
    vehicleImport:"Araç İthalat",vehicleExport:"Araç İhracat",spareParts:"Yedek Parça",documentTransfer:"Evrak Transferi",
    truckAdded:"Yeni tır kaydı oluşturuldu",truckAddedText:"Plaka ve operasyon bilgisi örnek tabloya eklendi."
  },
  en:{
    ready:"Ready",queued:"Queued",generating:"Generating",validating:"Validating",sending:"Sending",sent:"Sent",failed:"Failed",
    otomailReady:"Flow ready",otomailRunning:"Flow running",otomailComplete:"All reports delivered",runAgain:"Run Flow Again",runFlow:"Run Flow",
    robotReady:"Ready",robotRunning:"Running",robotComplete:"Completed",robotRun:"Run Robot Flow",robotAgain:"Run Flow Again",
    registered:"Entry record",waiting:"Waiting",processing:"Processing",complete:"Completed",
    vehicleImport:"Vehicle Import",vehicleExport:"Vehicle Export",spareParts:"Spare Parts",documentTransfer:"Document Transfer",
    truckAdded:"New truck record created",truckAddedText:"Plate and operation data were added to the sample table."
  }
};
const fileIconByType={xlsx:"assets/icons/excel.svg",pdf:"assets/icons/pdf.svg",csv:"assets/icons/csv.svg",log:"assets/icons/log.svg"};
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let otomailRunning=false,otomailCompleted=false,otomailRunNo=0,robotRunning=false,robotCompleted=false;

function setReportState(row,state){
  row.dataset.state=state;
  row.classList.toggle("is-processing",["generating","validating","sending"].includes(state));
  row.classList.toggle("is-sent",state==="sent");
  row.classList.toggle("is-failed",state==="failed");
  const status=row.querySelector(".report-status");
  status.className=`report-status state-${state}`;
  status.textContent=flowText[lang][state]||state;
}
function setPipelineStage(stageIndex){
  $$(".pipeline-node").forEach((node,index)=>{
    node.classList.toggle("is-active",index===stageIndex);
    node.classList.toggle("is-complete",index<stageIndex);
  });
}
function setMailPacket(row,stageIndex,visible=true){
  const packet=$("#mailPacket"),icon=$("#mailPacketIcon"),label=$("#mailPacketLabel");
  const type=row?.dataset.fileType||"xlsx";
  icon.src=fileIconByType[type]||fileIconByType.log;
  icon.alt=type.toUpperCase();
  label.textContent=type.toUpperCase();
  packet.style.left=["16%","50%","84%"][Math.max(0,Math.min(stageIndex,2))];
  packet.classList.toggle("is-visible",visible);
}
function updateOtomailMeta(state,fileName=""){
  const meta=$("#otomailRunMeta");
  meta.dataset.state=state;
  meta.dataset.fileName=fileName;
  if(state==="running"&&fileName) meta.textContent=`${fileName} · ${flowText[lang].otomailRunning}`;
  else if(state==="complete") meta.textContent=`${flowText[lang].otomailComplete} · ${String(otomailRunNo).padStart(2,"0")}`;
  else meta.textContent=flowText[lang].otomailReady;
}
function refreshOtomailLanguage(){
  $$(".report-row").forEach(row=>setReportState(row,row.dataset.state||"queued"));
  const meta=$("#otomailRunMeta");
  if(meta) updateOtomailMeta(meta.dataset.state||"ready",meta.dataset.fileName||"");
  const button=$("#runOtomailBtn");
  if(button){
    button.querySelector("span").textContent=otomailRunning?flowText[lang].otomailRunning:(otomailCompleted?flowText[lang].runAgain:flowText[lang].runFlow);
  }
}
async function runOtomailFlow(){
  if(otomailRunning) return;
  otomailRunning=true;otomailCompleted=false;otomailRunNo+=1;
  const button=$("#runOtomailBtn"),rows=$$(".report-row"),progress=$("#mailPipelineProgress"),packet=$("#mailPacket");
  button.disabled=true;button.querySelector("span").textContent=flowText[lang].otomailRunning;
  progress.style.width="0%";
  setPipelineStage(-1);
  packet.classList.remove("is-visible");
  rows.forEach((row,index)=>setReportState(row,index===0?"ready":"queued"));
  updateOtomailMeta("running",rows[0]?.dataset.fileName||"");

  for(let i=0;i<rows.length;i+=1){
    const row=rows[i];
    rows.forEach(item=>item.classList.remove("is-current"));
    row.classList.add("is-current");
    updateOtomailMeta("running",row.dataset.fileName);

    setReportState(row,"generating");setPipelineStage(0);setMailPacket(row,0,true);
    await sleep(480);
    setReportState(row,"validating");setPipelineStage(1);setMailPacket(row,1,true);
    await sleep(500);
    setReportState(row,"sending");setPipelineStage(2);setMailPacket(row,2,true);
    await sleep(620);
    setReportState(row,"sent");
    row.classList.remove("is-current");
    progress.style.width=`${((i+1)/rows.length)*100}%`;
    await sleep(180);
    packet.classList.remove("is-visible");
  }

  setPipelineStage(3);
  updateOtomailMeta("complete");
  otomailRunning=false;otomailCompleted=true;
  button.disabled=false;button.querySelector("span").textContent=flowText[lang].runAgain;
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
  robotRunning=true;robotCompleted=false;
  const lab=$(".automation-lab"),status=$("#robotStatus"),log=$("#robotLog"),button=$("#runRobotBtn");
  button.disabled=true;button.querySelector("span").textContent=flowText[lang].robotRunning;
  status.dataset.state="running";status.textContent=flowText[lang].robotRunning;
  lab.classList.add("is-running");log.innerHTML="";

  const steps=lang==="tr"?[
    ["Robot kuyruğu başlatıldı","START"],["INTAÇ oturumu güvenli şekilde açıldı","OK"],["Toplu sorgu parametreleri gönderildi","RUN"],
    ["Belge görüntüsü ve İNTAÇ tarihi alındı","OK"],["OCR alanları doğrulandı","OK"],["Veri Aycube entegrasyonuna aktarıldı","DONE"]
  ]:[
    ["Robot queue started","START"],["INTAÇ session opened securely","OK"],["Bulk query parameters submitted","RUN"],
    ["Document image and INTAÇ date retrieved","OK"],["OCR fields validated","OK"],["Data transferred to Aycube integration","DONE"]
  ];
  for(const step of steps){appendRobotLog(step[0],step[1]);await sleep(430)}
  lab.classList.remove("is-running");
  status.dataset.state="complete";status.textContent=flowText[lang].robotComplete;
  robotRunning=false;robotCompleted=true;button.disabled=false;button.querySelector("span").textContent=flowText[lang].robotAgain;
}

const plateCodes=["06","16","34","35","41","42","54","67","81"];
const plateLetters="ABCDEFGHJKLMNPRSTUVYZ";
const usedPlates=new Set($$(".truck-row strong").map(node=>node.textContent.trim()));
const truckOperations=["vehicleImport","vehicleExport","spareParts","documentTransfer"];
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
function trimTruckRows(){
  const rows=$$("#truckTableBody .truck-row");
  if(rows.length<=8)return;
  for(let i=rows.length-1;i>=0&&$$("#truckTableBody .truck-row").length>8;i-=1){
    if(rows[i].dataset.status==="complete")rows[i].remove();
  }
}
function addTruckEntry(){
  const button=$("#addTruckBtn");
  button.disabled=true;setTimeout(()=>button.disabled=false,550);
  const body=$("#truckTableBody"),row=document.createElement("div"),plate=generateUniquePlate(),operation=randomFrom(truckOperations);
  row.className="truck-row is-new is-transitioning";row.dataset.operation=operation;row.dataset.status="registered";
  row.innerHTML=`<span>${new Date().toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"})}</span><strong>${plate}</strong><span class="truck-operation"></span><small class="truck-status status-registered"></small>`;
  body.prepend(row);updateTruckRowLanguage(row);
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
function refreshDynamicLanguage(){
  refreshOtomailLanguage();
  $$(".truck-row").forEach(updateTruckRowLanguage);
  const robotStatus=$("#robotStatus");
  if(robotStatus){
    const state=robotStatus.dataset.state||"ready";
    robotStatus.textContent=state==="running"?flowText[lang].robotRunning:state==="complete"?flowText[lang].robotComplete:flowText[lang].robotReady;
  }
  const robotButton=$("#runRobotBtn");
  if(robotButton)robotButton.querySelector("span").textContent=robotRunning?flowText[lang].robotRunning:(robotCompleted?flowText[lang].robotAgain:flowText[lang].robotRun);
}

function updateLanguage(){
document.documentElement.lang=lang;$("#langBtn").textContent=lang.toUpperCase();
$$("[data-tr][data-en]").forEach(n=>n.textContent=n.dataset[lang]);sectionName.textContent=titleFor(current);buildOverview();
const p=$(".engine-node.is-active");if(p)renderPartnership(p.dataset.partnership);
const i=$(".integration-tab.is-active");if(i)renderIntegration(i.dataset.integrationTab);
setSupalanImage(supalanCurrent);refreshDynamicLanguage();
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
  if(projectMedia){
    const card=projectMedia.closest(".project-card"),img=projectMedia.querySelector("img");
    const gallery=galleryForProjectKey(card?.dataset.project);
    const items=gallery.length?gallery:[{src:img?.getAttribute("src"),title:img?.alt||"Proje görseli"}];
    return {items,index:indexForSource(items,img?.getAttribute("src"))};
  }

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
  const zoomZones=".project-card-media,.screenshot-visual,.aycube-preview-card,.supalan-hero,.supalan-thumb,.supalan-web-card,.team-photo-wrap,.robot-avatar";
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
$$(".agenda-card").forEach(c=>c.addEventListener("click",()=>navigate(Number(c.dataset.target))));
$$("[data-team-card]").forEach(card=>card.addEventListener("click",()=>{const open=!card.classList.contains("is-open");$$("[data-team-card]").forEach(x=>{x.classList.remove("is-open");x.setAttribute("aria-expanded","false")});if(open){card.classList.add("is-open");card.setAttribute("aria-expanded","true")}}));
$$(".engine-node").forEach(b=>b.addEventListener("click",()=>{$$(".engine-node").forEach(x=>x.classList.remove("is-active"));b.classList.add("is-active");renderPartnership(b.dataset.partnership)}));
$$(".project-card").forEach(b=>b.addEventListener("click",()=>openInfo(projectData[lang][b.dataset.project],projectScreens[b.dataset.project]||[])));
$("#allProjectsBtn").addEventListener("click",()=>openCatalog("FORD PROJECT CATALOG",lang==="tr"?"Ford Otosan Proje Kataloğu":"Ford Otosan Project Catalogue",lang==="tr"?"Kullanıcı tarafından paylaşılan 29 proje, operasyonel yetkinliklere göre gruplandırılmıştır.":"The 29 projects supplied by the user are grouped by operational capability.",projectCatalog[lang]));
$$(".integration-tab").forEach(b=>b.addEventListener("click",()=>{$$(".integration-tab").forEach(x=>x.classList.remove("is-active"));b.classList.add("is-active");renderIntegration(b.dataset.integrationTab)}));
$$(".special-card").forEach(b=>b.addEventListener("click",()=>openInfo(specialData[lang][b.dataset.special],specialScreens[b.dataset.special]||[])));
startSupalanAutoplay();

$("#runOtomailBtn").addEventListener("click",runOtomailFlow);
$("#allReportsBtn").addEventListener("click",()=>openCatalog("OTOMAIL REPORT CATALOG",lang==="tr"?"Ford Otomail Rapor Kataloğu":"Ford Otomail Report Catalogue",lang==="tr"?"Kullanıcı tarafından paylaşılan 37 rapor kaydı konu başlıklarına göre gruplanmıştır. Aynı adla tekrarlanan kayıtlar kaynak listedeki biçimiyle korunmuştur.":"The 37 report entries supplied by the user are grouped by subject. Repeated names are preserved as supplied.",reportCatalog[lang]));

$("#runRobotBtn").addEventListener("click",runRobotFlow);
$("#intacDetailBtn").addEventListener("click",()=>openInfo(lang==="tr"?["INTAÇ AUTOMATION","Ford INTAÇ Sorgulama","Robotun portal oturumu açması, sorgu parametrelerini girmesi, sonucu alması ve sonraki sisteme kontrollü biçimde aktarması.",["Tekrarlı portal adımlarının otomasyonu","Sorgu sonuçlarının loglanması","Hata ve istisna durumlarının işaretlenmesi","Aycube ve ilgili sistemlere aktarım"],"flow"]:["INTAÇ AUTOMATION","Ford INTAÇ Query","The robot opens the portal session, enters query parameters, retrieves the result and transfers it to the next system in a controlled flow.",["Automation of repetitive portal steps","Query-result logging","Error and exception marking","Transfer to Aycube and related systems"],"flow"],projectScreens.intac));

$("#addTruckBtn").addEventListener("click",addTruckEntry);
$("#modalClose").addEventListener("click",()=>infoModal.close());infoModal.addEventListener("click",e=>{if(e.target===infoModal)infoModal.close()});
$("#modalGallery")?.addEventListener("click",event=>{
  const figure=event.target.closest("figure");
  if(!figure) return;
  const figures=$$("#modalGallery figure");
  const items=figures.map(fig=>({src:fig.querySelector("img")?.getAttribute("src"),title:fig.querySelector("figcaption")?.textContent?.trim() || fig.querySelector("img")?.alt || "Aycube ekranı"}));
  const idx=figures.indexOf(figure);
  openLightbox(items,idx>=0?idx:0);
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
