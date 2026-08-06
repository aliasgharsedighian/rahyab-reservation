# راهنمای پروژه Rahyab Reservation

این فایل مرجع کاری عامل‌های توسعه برای شناخت سریع پروژه و حفظ الگوهای فعلی آن است. پیش از هر تغییر، `AGENTS.md` و راهنمای مرتبط نسخه نصب‌شده Next.js در `node_modules/next/dist/docs/` نیز باید خوانده شوند.

## هدف محصول

این سامانه برای رزرو غذای کارکنان یک سازمان ساخته شده است. کاربر پس از ورود می‌تواند منوی هفتگی را ببیند، غذا رزرو کند، رزروهای آینده و سوابق خود را مدیریت کند، درباره غذا بازخورد بدهد، اعلان‌ها و گردش کیف پول را ببیند و اطلاعات و علایق غذایی پروفایل خود را تغییر دهد.

رابط کاربری فارسی، راست‌به‌چپ و واکنش‌گرا است و نسخه موبایل در بعضی بخش‌ها نمایش اختصاصی دارد.

## پشته فنی

- Next.js `16.2.4` با App Router، React `19.2.4` و TypeScript با حالت `strict`
- Tailwind CSS 4 و CSS variables برای تم و رنگ‌ها
- shadcn `4.4.0` با سبک `radix-nova` و primitiveهای `radix-ui`
- `lucide-react` برای آیکن‌ها
- Redux Toolkit + React Redux برای state سراسری
- `redux-persist` برای نگهداری state در storage مرورگر
- React Hook Form + Zod برای فرم و اعتبارسنجی
- `next-themes` برای تم روشن/تیره/سیستمی
- Sonner برای toastها
- `date-fns`، `react-multi-date-picker` و `react-day-picker` برای تاریخ
- Framer Motion برای انیمیشن، Embla برای carousel و React Paginate برای صفحه‌بندی

دستورهای اصلی:

```bash
npm run dev      # اجرا روی پورت 3003
npm run build
npm run lint
npm run start
```

## ساختار پروژه

```text
app/                         routeها، layoutها و کامپوننت‌های featureمحور
  login/                     ورود/ثبت‌نام
  dashboard/                 پوسته و صفحات پنل کارمند
    reserve/                 منوی هفتگی، سبد و ثبت رزرو
    upcoming-reserve/        رزروهای آینده و لغو رزرو
    history-reserve/         سوابق و ثبت نظر غذا
    wallet/                  گردش کیف پول و افزایش اعتبار
    notifications/           اعلان‌ها
    profile/                 مشخصات، رمز، تصویر و علایق غذایی
    components/              اجزای مشترک داشبورد و فیلترها
    context/                 NotificationContext
actions/                     اکشن‌های ورود و مدیریت کوکی
components/ui/               primitiveهای shadcn/Radix
components/                  provider تم و اجزای عمومی
redux/                       store، provider و sliceها
hooks/                       hookهای عمومی
lib/                         utilityهای مشترک
public/assets/               تصویرها و فونت‌های محلی
proxy.ts                     محافظت خوش‌بینانه مسیرهای login/dashboard
typing.d.ts                  typeهای سراسری فعلی
```

Alias مسیر `@/*` به ریشه پروژه اشاره می‌کند. برای importهای داخلی از آن استفاده شود.

## Routeها و مسئولیت آن‌ها

- `/` بلافاصله به `/login` هدایت می‌شود.
- `/login` فرم ورود فارسی را نمایش می‌دهد. اعتبارسنجی با Zod/React Hook Form انجام می‌شود.
- `/dashboard` در وضعیت فعلی فقط هدر پیشخوان را دارد.
- `/dashboard/home` placeholder ساده است.
- `/dashboard/reserve` منوی هفتگی را از `weekly-menu` می‌گیرد و UI تعاملی رزرو را render می‌کند.
- `/dashboard/upcoming-reserve` رزروهای آینده را با queryهای صفحه‌بندی/فیلتر می‌گیرد.
- `/dashboard/history-reserve` تاریخچه رزرو و امکان بازخورد غذا را ارائه می‌کند.
- `/dashboard/wallet` تراکنش‌های کیف پول را با فیلتر و صفحه‌بندی نمایش می‌دهد.
- `/dashboard/notifications` اعلان‌ها را دریافت و نمایش می‌دهد.
- `/dashboard/profile` پروفایل و گزینه‌های علایق غذایی را دریافت می‌کند.

صفحات داده‌محور داشبورد عموماً Server Component هستند: token را با `cookies()` می‌خوانند، داده API را fetch می‌کنند و نتیجه را به یک Client Component یا جدول تعاملی می‌دهند. `searchParams` در Next.js 16 به‌شکل Promise مصرف می‌شود.

## معماری رندر و جریان داده

### Server Components

فایل‌های `page.tsx` بخش‌های reserve، upcoming، history، wallet، notifications و profile روی سرور fetch می‌کنند. layout داشبورد نیز Server Component است و مقدار اولیه باز/بسته بودن sidebar را از کوکی `sidebar_state` می‌خواند.

برای کد جدید، مرز Client تا حد ممکن پایین و نزدیک تعامل نگه داشته شود. صفحه یا layout فقط زمانی Client شود که مستقیماً به hook مرورگر، event handler یا context نیاز دارد.

### Client Components

کامپوننت‌های دارای فرم، modal، state، Redux، `localStorage` و eventها با `"use client"` مشخص شده‌اند. نام‌گذاری فعلی معمولاً از الگوی `Client*Page` برای پل بین صفحه سروری و UI تعاملی استفاده می‌کند.

### State سراسری

`redux/store.ts` دو reducer را با `redux-persist` نگهداری می‌کند:

- `authReducer`: اطلاعات کاربر، token، وضعیت auth، آدرس و تاریخچه محصول
- `reserveBasket`: اقلام رزرو، تعداد و محاسبات مجموع

`ReduxProvider` در root layout کل اپ را پوشش می‌دهد. سبد رزرو با actionهایی مثل add/remove/update/clear مدیریت می‌شود. sync خودکار سبد با backend در store وجود دارد اما فعلاً comment شده است.

`NotificationContext` مخصوص داشبورد است؛ اعلان‌های خوانده‌نشده را می‌گیرد و عملیات mark-seen را انجام می‌دهد.

## API و احراز هویت

آدرس backend از متغیر زیر خوانده می‌شود:

```text
NEXT_PUBLIC_API_ADDRESS
```

endpointهای مشاهده‌شده:

- `auth/login`, `auth/logout` و `logout`
- `profile`, `profile/change-password`, `profile/food-preferences`
- `food-preferences`
- `weekly-menu`
- `reservations`, `reservations/upcoming`, `reservations/history`
- `reservations/{id}/cancel`, `reservations/payment/callback`
- `reservation-feedbacks`, `reservation-feedbacks/by-food`
- `wallet`
- `notifications`, `notifications/mark-seen`

درخواست‌های authenticated هدر زیر را ارسال می‌کنند:

```text
Authorization: Bearer <token>
Accept: application/json
```

وضعیت فعلی auth دوگانه است:

- کوکی `user_token` برای Proxy و fetchهای Server Component
- کلید `token` در `localStorage` برای fetchهای Client Component و Redux

`proxy.ts` در Next.js 16 جایگزین نام قدیمی Middleware است و فقط یک بررسی خوش‌بینانه بر وجود کوکی انجام می‌دهد: کاربر بدون کوکی از dashboard به login و کاربر دارای کوکی از login به dashboard هدایت می‌شود. این لایه اعتبار واقعی session یا مجوز را تأیید نمی‌کند.

تا قبل از یک refactor هماهنگ سمت backend/frontend، هر تغییر auth باید هر دو محل token، رفتار logout و redirectها را بررسی کند. token یا محتوای `.env` هرگز در سند، log یا خروجی commit نشود.

## کامپوننت‌های پروژه

### پوسته و ناوبری

- `DashboardSidebar` و `SidebarApp`: منوی اصلی، لینک صفحات، خروج، قوانین و تماس
- `DashboardHeader`: عنوان، پروفایل، اطلاعات کاربر و popover اعلان‌ها
- `DashboardContent`: ظرف محتوای داشبورد
- `DashboardPagination`: همگام‌سازی صفحه با query string
- `ReservationFilters`, `WalletFilters`, `DateFilter`: فیلترهای URLمحور
- `WalletChargeGuideModal`: راهنمای شارژ کیف پول پس از ورود، شامل محاسبه کسری و کپی اطلاعات واریز
- `RulesModal`, `ContactModal`: دیالوگ قوانین و ارتباط

### رزرو غذا

- `ClientReservePage`: هماهنگ‌کننده سبد، ثبت رزرو و callback پرداخت
- `FoodReserveTabs`: گروه‌بندی منوی هفتگی بر اساس روز/tab
- `FoodReserveInvoice`: ردیف/کارت غذای قابل رزرو و کنترل تعداد
- `FoodReserveCardMobile`: نمایش اختصاصی موبایل
- `FoodReserveCart`: خلاصه سبد
- `FeedbackModal`: نمایش/ثبت بازخورد غذا

### سایر featureها

- `ReserveUpcomingTable`, `CancelReservationModal`
- `ReserveHistoryTable`, `CommentOnFoodModal`
- `WalletTable`, `AddCreditModal`
- `ClientNotificationsPage`
- `ClientProfilePage`, `ProfileForm`, `IntrestProfile` (نام فعلی فایل typo دارد و بدون refactor هماهنگ rename نشود)

### UI primitives موجود

در `components/ui` این primitiveها آماده‌اند و برای UI جدید باید پیش از ساخت کامپوننت پایه جدید بررسی شوند:

`accordion`, `alert-dialog`, `avatar`, `badge`, `button`, `calendar`, `card`, `carousel`, `checkbox`, `collapsible`, `dialog`, `direction`, `drawer`, `dropdown-menu`, `field`, `form`, `input`, `input-group`, `label`, `menubar`, `popover`, `scroll-area`, `select`, `separator`, `sheet`, `sidebar`, `skeleton`, `slider`, `sonner`, `spinner`, `switch`, `table`, `tabs`, `textarea`, `tooltip`.

برای ترکیب classها از `cn()` در `lib/utils.ts` استفاده شود. UI و متن جدید باید RTL، فارسی، dark mode و breakpoint موبایل را حفظ کند.

## فرم‌ها و تعاملات

- فرم‌های login/register با React Hook Form، Zod و `zodResolver` ساخته شده‌اند.
- `ProfileForm` نیز React Hook Form دارد ولی type/validation آن باید هنگام تغییر دقیق بررسی شود.
- عملیات async در چند نقطه با `useTransition` و در بقیه با state محلی loading کنترل می‌شود.
- پیام موفقیت/خطا از Sonner و Toaster سراسری root layout استفاده می‌کند.
- فیلترها و pagination پارامترهای URL را تغییر می‌دهند تا صفحه سروری داده تازه بگیرد.

## ظاهر و دارایی‌ها

- سند ریشه `lang="fa"` و `dir="rtl"` دارد.
- فونت‌های محلی ایران‌سنس با `next/font/local` و CSS variableهای `--main-font` و `--farsi-bold-font` بارگذاری می‌شوند.
- رنگ‌ها و theme tokenها در `app/globals.css` تعریف شده‌اند.
- تصاویر محلی در `public/assets/images` قرار دارند.
- `next/image` فقط تصاویر remote با protocol `http` و hostname `panel.bitnasb.ir` را طبق `next.config.ts` می‌پذیرد.
- دو breakpoint متفاوت برای hook موبایل وجود دارد: `768px` در `hooks/use-mobile.ts` و `640px` در `app/components/hooks/use-mobile.ts`. هنگام استفاده یا یکپارچه‌سازی به این تفاوت توجه شود.

## قراردادهای توسعه برای کارهای بعدی

1. قبل از تغییر Next.js، راهنمای مرتبط همین نسخه را در `node_modules/next/dist/docs/` بخوان؛ به دانش نسخه‌های قدیمی تکیه نکن.
2. الگوی Server fetch + Client interaction فعلی را حفظ کن، مگر اینکه کار مشخصاً refactor معماری باشد.
3. از primitive موجود در `components/ui` و tokenهای `globals.css` استفاده کن؛ component پایه تکراری نساز.
4. متن و layout را فارسی، RTL، responsive و سازگار با dark mode نگه دار.
5. برای feature-specific component از پوشه همان route و برای primitive عمومی از `components/ui` استفاده کن.
6. requestهای API باید حالت‌های loading، خطای شبکه، پاسخ غیرموفق و unauthorized را مدیریت کنند.
7. query string، pagination و filterهای فعلی را هنگام تغییر صفحات لیستی حفظ کن.
8. type دقیق تعریف کن و از افزودن `any` جدید پرهیز کن. type مشترک واقعی را در محل مشترک قرار بده.
9. secrets و مقادیر `.env` را نخوان/منتشر نکن؛ فقط نام متغیرهای لازم را مستند کن.
10. پس از تغییر کد حداقل `npm run lint` و برای تغییرات ساختاری `npm run build` اجرا شود.

## بدهی‌ها و ریسک‌های شناخته‌شده

این موارد صرفاً وضعیت فعلی‌اند و بدون درخواست جداگانه نباید هم‌زمان با یک feature نامرتبط اصلاح شوند:

- token هم‌زمان در cookie، localStorage و Redux نگهداری می‌شود و logout endpointها نیز یکدست نیستند.
- cookie در `loginCookiesAction` بدون گزینه‌های صریح `httpOnly`, `secure`, `sameSite` و expiry تنظیم می‌شود.
- `NEXT_PUBLIC_API_ADDRESS` در کد Client عمومی است؛ این موضوع برای base URL عادی است اما secret نباید در متغیر public باشد.
- typeهای زیادی `any` هستند؛ `typing.d.ts` نیز `sting` typo دارد و `reserveCartType` خالی است.
- metadataهای فارسی در خروجی فعلی نشانه‌های encoding خراب دارند و باید هنگام کار مرتبط اصلاح شوند.
- چند مسیر/کامپوننت تکراری یا بلااستفاده به نظر می‌رسند: دو hook موبایل، `DashboardSidebar`/`SidebarApp`/`app-sidebar` و فرم‌های login جداگانه.
- `FeedbackModal` یک endpoint محلی `/api/foods/...` را صدا می‌زند، ولی route handler متناظر در inventory فعلی دیده نشد.
- middleware sync سبد با backend comment شده است؛ در نتیجه persisted cart الزاماً با server همگام نیست.
- تست خودکار در `package.json` تعریف نشده است.
- افزایش اعتبار کیف پول در `AddCreditModal` فعلاً کامل به API متصل نشده است.

## چک‌لیست هر تغییر

- محدوده feature و routeهای درگیر مشخص شده است.
- راهنمای Next.js 16 مرتبط خوانده شده است.
- مرز Server/Client و منبع token بررسی شده است.
- primitiveها و الگوهای موجود دوباره استفاده شده‌اند.
- حالت‌های موبایل، RTL و dark mode بررسی شده‌اند.
- loading/error/empty state و پاسخ unauthorized پوشش داده شده‌اند.
- lint و در صورت نیاز build اجرا شده‌اند.
- فقط فایل‌های مرتبط تغییر کرده‌اند و تغییرات قبلی کاربر دست‌نخورده مانده‌اند.
