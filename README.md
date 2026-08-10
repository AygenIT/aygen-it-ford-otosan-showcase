# Aygen IT × Ford Otosan — Light Cinematic Executive Showcase V17

Yalnızca HTML, CSS ve JavaScript kullanır. İnternet veya harici kütüphane gerektirmez.

## V6 yenilikleri

- 29 Ford projesi beş yetkinlik grubunda sunuma işlendi.
- Proje kartları gerçek proje isimleriyle açılır detay kartlarına dönüştürüldü.
- “29 Projenin Tamamını Gör” interaktif katalog ekranı eklendi.
- Kullanıcı tarafından iletilen 37 rapor kaydı Otomail rapor kataloğuna eklendi.
- Otomail slaytındaki örnek liste gerçek rapor isimleriyle güncellendi.
- RPA & OCR sahnesine Toplu İNTAÇ, TAREKS RPA, Ford Fatura OCR ve 0910 kontrolü eklendi.
- Entegrasyon slaytlarında Ford Entegrasyon, otomatik alanlar, saymanlık, arşiv fihrist, beyanname görüntüsü, dekont ve ekstre akışları işlendi.

## Kullanım

- ZIP dosyasını çıkartın.
- `index.html` dosyasını açın.
- Sağ/sol ok veya Space ile ilerleyin.
- F: Tam ekran
- O: Sunum haritası
- TR/EN: Dil değişimi

## Demo veri notu

Supalan saha kapasitesi ve canlı panel değerleri görsel demo verileridir. Gerçek KPI değerleri doğrulandıktan sonra değiştirilmelidir.

## Fotoğraf değişimi

`assets/team` klasöründeki PNG dosyalarını aynı isimle değiştirin:

- serkan-duran.png
- yener-karatas.png
- ebru-selvi.png
- berk-efe-tas.png
- fatih-suha-selvi.png


## V7 güncellemesi
- Supalan slaytına kullanıcı tarafından sağlanan gerçek drone görselleri eklendi.
- Büyük hero görsel + küçük galeri + dönen fotoğraf akışı kuruldu.
- KPI kartları ve tır kayıt tablosu korunarak saha görselleriyle birleştirildi.

## V8 — Sağlamlaştırılmış interaktif akışlar

- Otomail akışı artık durum makinesiyle çalışır: Sırada → Üretiliyor → Doğrulanıyor → Gönderiliyor → Gönderildi.
- Aynı akış iki kez üst üste başlatılamaz; işlem sırasında buton kilitlenir.
- PDF ve XLSX raporları kendi dosya tipi ve gerçek görsel ikonlarıyla ilerler.
- Hareketli dosya paketi aktif raporun gerçek uzantısını ve ikonunu gösterir.
- Supalan tır girişlerinde benzersiz ve gerçekçi plaka üretilir.
- Yeni tır kayıtları giriş → bekleme → işlem → tamamlanma yaşam döngüsünden geçer; sayaç ve kapasite buna göre güncellenir.
- Kapasite dolduğunda yeni kayıt engellenir ve kullanıcıya açıklama gösterilir.
- Supalan “Rapor Oluştur” butonu Excel uyumlu CSV dosyasını gerçekten indirir.
- RPA akışı tekrar tıklamalara karşı kilitlenir ve adımları sırayla, dinamik zaman damgalarıyla tamamlar.

## V13 — Yönetici etkisi ve görsel güçlendirme

- Sunum anlatısı dört değer ekseninde yeniden kuruldu: sahiplik, platform, otomasyon ve saha etkisi.
- Tüm ana başlıklar konu adı yerine yönetici mesajı taşıyan sonuç cümlelerine dönüştürüldü.
- Ekip kartlarındaki örnek iletişim bilgileri kaldırıldı; gerçek sorumluluk ve katkı alanları öne çıkarıldı.
- Entegrasyon ekranındaki doğrulanmamış demo yüzdeleri kaldırıldı; kapsamı gösteren dört akış / tek omurga anlatımı getirildi.
- Açılış, içerik slaytları ve kapanış için tipografi, kontrast, boşluk ve sunum ölçeği güçlendirildi.
- 1920×1080 ve 1366×768 ekranlarda taşma ve kontrol çakışmaları giderildi.
- Azaltılmış hareket tercihlerinde görünmez kalan içerik sorunu düzeltildi.

## V14 — Sinematik görsel dil

- Açılış ve kapanış, otomotiv üretimi ile lojistik operasyonlarını tek dijital omurga metaforunda buluşturan özel sinematik sahnelerle yeniden tasarlandı.
- Entegrasyon, Otomail ve iş birliği bölümlerine dört veri akışının tek omurgada birleşmesini anlatan üretilmiş görsel katman eklendi.
- RPA & OCR bölümüne belgeden doğrulanmış veriye dönüşümü gösteren özel süreç sahnesi eklendi.
- Supalan slaytı gerçek drone fotoğrafını kullanan koyu, yüksek kontrastlı saha bölümüne dönüştürüldü.
- Açık ve koyu bölümler arasında ritim kuran yeni bölüm sistemi, cam yüzeyler ve ışık geçişleri uygulandı.
- Sahiplik, platform, otomasyon, saha, ithalat, ihracat, arşiv ve banka için projeye özgü ikon seti oluşturuldu.
- Bölüm geçişi; yön duyarlı sinematik perde, ışık çizgisi ve bölüm başlığıyla güçlendirildi.
- 1920×1080 ve 1366×768 görsel kontrolleri ile etkileşim smoke testi tamamlandı.

## V15 — Akıcı geçiş optimizasyonu

- Ağır `clip-path`, tam ekran görsel hareketi ve üç katmanlı perde animasyonu kaldırıldı.
- Geçiş, tek kompozit katmanda çalışan sinematik kararma → bölüm başlığı → açılma akışına dönüştürüldü.
- Geçiş süresi 980 ms’den 660 ms’ye indirildi; hedef slayt perde arkasında 245 ms’de hazırlanıyor.
- Slayt girişlerindeki hareketli blur filtreleri kaldırıldı; yalnızca opacity ve transform kullanılıyor.
- Geçiş sırasında sürekli arka plan animasyonları ve cam blur işlemleri geçici olarak duraklatılıyor.
- Sinematik görseller yaklaşık 5,48 MB PNG’den toplam 0,60 MB optimize JPEG’e dönüştürüldü ve ön yükleme eklendi.
- Sonraki/önceki slaytlar boşta kalınan anda görünmez şekilde önceden hazırlanıyor.

## V16 — Light Cinematic Show

- Sunumun tamamı tek ve tutarlı premium açık tema sistemine taşındı.
- Sinematik proje görselleri açık arka planlarda atmosferik katman olarak korunuyor.
- Güçlü bölüm geçişi; üç katmanlı, yön duyarlı, yalnızca transform ve opacity kullanan akıcı bir perde olarak geri getirildi.
- Proje ekranları, Supalan galerisi, ekip portreleri, BerkBOT ve logolar tıklanarak büyük görüntülenebiliyor.
- Görsellerin büyütülebilir olduğunu anlatan görünür zoom işaretleri ve klavye ile galeri gezinmesi eklendi.

## V17 — Güvenilir görsel görüntüleyici

- Kartlar ile görseller arasındaki tıklama çakışmaları merkezi olay yönetimiyle giderildi.
- Kartın görsel alanına basıldığında doğrudan lightbox açılıyor; kartın detay davranışı tetiklenmiyor.
- Detay modalındaki galeriler lightbox ile uyumlu hâle getirildi.
- Aycube, Supalan, ekip ve logo görselleri kendi galerileri içinde sağ/sol yön tuşlarıyla gezilebiliyor.
- Mobil galeride yatay kaydırma desteği eklendi.
