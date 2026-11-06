# AEGIS على GitHub Pages

## النشر من حسابك

1. سجّل الدخول في GitHub بحسابك الشخصي. أنشئ مستودعًا باسم `AEGIS`. على GitHub Free يلزم مستودع عام لتفعيل Pages.
2. فك ضغط الحزمة. ارفع **محتويات** مجلد `AEGIS-GitHub-Pages` مباشرة إلى جذر المستودع، بحيث يظهر `index.html` و`.nojekyll` في الصفحة الأولى للمستودع. استخدم **Add file → Upload files → Commit changes**.
3. افتح **Settings → Pages**. تحت **Build and deployment** اختر **Deploy from a branch**، ثم فرع `main` ومجلد `/(root)` واضغط **Save**.
4. بعد اكتمال النشر يظهر زر **Visit site**. على مستودع اسمه AEGIS يكون الرابط عادةً على نمط `https://YOUR-USERNAME.github.io/AEGIS/`.

## التعديل من GitHub

افتح الملف من تبويب **Code** واضغط زر القلم، ثم **Commit changes**. ينشر GitHub التغيير تلقائيًا من الفرع المحدد.

| التعديل | الملف |
| --- | --- |
| عنوان ووصف الصفحة بالعربية والإنجليزية | `site-content.json` |
| نصوص التنبيهات | `advisories.json` |
| الألوان والمظهر | `style.css` |
| هيكل الصفحة | `index.html` |

يقرأ AEGIS صيغة الرابط محليًا. فحص النطاق يرسل اسم النطاق فقط إلى Cloudflare ويقارن ردّ محلّل DNS العادي بفلتر البرامج الخبيثة. التحليل المحلي لا يرسل النطاق، ولا يفتح AEGIS الرابط في الوضعين. فحص سمعة المسار الكامل أو محتوى الصفحة يحتاج خدمة مستقلة.

[إنشاء GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site) · [إعداد فرع النشر](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
