/** @odoo-module **/

import { browser } from "@web/core/browser/browser";
import { _t } from "@web/core/l10n/translation";
import { registry } from "@web/core/registry";
import { blockUI, unblockUI } from "@web/core/ui/ui_service";
import { SCRIPT_LOADING_FAILURE_TIMEOUT } from "@web/webclient/crash_manager/crash_manager";


const qzTrayService = {
    dependencies: ["rpc", "notification"], // Added 'notification' dependency for error messages
    async start(env, { rpc, notification }) {
        // Ensure QZ Tray is loaded
        if (typeof qz === 'undefined') {
            console.error("QZ Tray library (qz-tray.js) not loaded!");
            notification.add(_t("QZ Tray library is not loaded. Please ensure qz-tray.js is correctly included."), {
                title: _t("Printing Error"),
                type: "danger",
                sticky: true,
            });
            return;
        }

        // --- STEP 1: Set Certificate Promise ---
        qz.security.setCertificatePromise(function(resolve, reject) {
            // IMPORTANT: Replace 'cert123' with your actual, full base64-encoded digital certificate content.
            var certificate = "LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUV5akNDQXJLZ0F3SUJBZ0lRTnpreU1ESTFNRGN5TkRFMk16TXpOakFOQmdrcWhraUc5dzBCQVEwRkFEQ0IKbURFTE1Ba0dBMVVFQmhNQ1ZWTXhDekFKQmdOVkJBZ01BazVaTVJzd0dRWURWUVFLREJKUldpQkpibVIxYzNSeQphV1Z6TENCTVRFTXhHekFaQmdOVkJBc01FbEZhSUVsdVpIVnpkSEpwWlhNc0lFeE1RekVaTUJjR0ExVUVBd3dRCmNYcHBibVIxYzNSeWFXVnpMbU52YlRFbk1DVUdDU3FHU0liM0RRRUpBUllZYzNWd2NHOXlkRUJ4ZW1sdVpIVnoKZEhKcFpYTXVZMjl0TUI0WERUSTFNRGN5TkRFMk16TXpObG9YRFRJMU1Ea3lNakUxTlRneU5sb3dnWU14Q3pBSgpCZ05WQkFZTUFreENNUTR3REFZRFZRUUlEQVZPYjNKMGFERVFNQTRHQTFVRUJ3d0hWSEpwY0c5c2FURU1NQW9HCkExVUVDZ3dEUmsxRE1Rd3dDZ1lEVlFRTERBTkdUVU14RERBS0JnTlZCQU1NQTBaTlF6RW9NQ1lHQ1NxR1NJYjMKRFFFSkFRd1pZV2h0WVdRdVluTmhkQzR4TlM0elFHZHRZV2xzTG1OdmJUQ0NBU0l3RFFZSktvWklodmNOQVFFQgpCUUFEZ2dFUEFEQ0NBUW9DZ2dFQkFKemdSem5FYmNTenFPWThyeGRQZUw4WW5vN1RDUktvTGFCbUlUMmtXd1dRCnhBS0V1WVFURFFLVTRhWFRnZTJlY2VCSDF0T3RjMHA5NHJPOTQrVDRmVWRnSGJzOUNqbWIvYzhCOUpHMnN6M3YKenU4T1BjSEllUC8wN3FSa3c3ZmoyQWZrL1g1a3lZdFNWUUQxaWJGMnBHTzlqQnpXNXkvMmxMZk1nNWdtbDZUYgpSemFyZ2lmRG5aOFVnMWFkamJmQXpyVXNmUU5VY0IybkdvQ09MTEx1OTJySVdlalpzdmVhWFlaUlRaS3FIUTAyCitZcmhNWFhSSURaeWVhVm9INTluZ2xVamxiTFVJZ1ZiU21RaDBOSDNkMkhNY3JXRGJQN1JWYTJZZ1JjWSt1bUgKZDdMY2hDU1hKaXdGcncvTVpMTDN1clVxSFluR0ZiZTJyUGRDcTIySlc5RUNBd0VBQWFNak1DRXdId1lEVlIwagpCQmd3Rm9BVWtLWlF0NFRVdWVwZjhnV0VFM2hGNktsMVZGd3dEUVlKS29aSWh2Y05BUUVOQlFBRGdnSUJBTGk4CllnWWs1TUdJZTdEaUFSWjlaVFlZazh3UjlZNTloVktNRm9XWHdBT1g4bVk2ZVhFa1hsZGl3ZnFRNktTUVN1WFMKblpHclJHanF4bzZwaEdhMVhoUXRaZHdnbUh0c3NEREp1MEdIYXNxRlVhN0dRRHBSVjZWNDNZT0pQbGUyKzl4LwoyRDh1UEhNeGRDeVBsSE5RU1RYak1xeVBGN1dsbDh5TzF2aVhyUGRudW82N0ViWUVEWm9PS1g4dk0wbFhEcFA1CmkwcmV1OEJaS2Fyd3FLUzg3N3dTR1JnVGZvQjhuRGExMWZHcHc0aXdzVWJUcThpYXBoVlA2ZG5RemJOZnIzTjMKZVhxbGdrTmkxRjFOdC9sVmV4RUVNdkhDQ1dqdVA3QVVUbzhNTVRBaldRUkdkSmxmMllaU2FVYVUreWlOVE1sbwpRMU1BOTEyVkI5UzZxWncrTUxaV0FZemhZYnZBcWVaa1lvRW1wNVZwSThtSHBsalVKMThaaFBIZDJZYWVYd3MzCjdQYkxLTE51VDA1TFEvUnAxV2wyNVpaaG9PN0tiYVNISWRzc3dCcTRsZHRiY1NaZUIvZ0NTVXlLWkJqcE9pRzgKRURydnRoOU10RlA2QW15aUJhMEhpSWJDaE51OTdid1pBMFpxRDR2ZmNaV3BxL0hGY29WU3d3TlJ0SmVRNU9ZOAprMzNXcGxWT1FVMGtOOW03K2pkaUlUNHVKTy85WDNTa0FubEgyN01ubUdYVkdFSmw0MEJnWEkxNDRYbzBybzlDClR4dWFZOVJNam9zc0hnVUJOeHZGUVRvSFp1V0dza3RBR0RMY0NxQlJjL01wOFBnRGc1WndOOFdtVysxTGdUZ28KOGN5UWdsYUc3eG1iNHROTjF1clI0WncrMC9DZ1I2ZjQ0ampUOGVEUQotLS0tLUVORCBDRVJUSUZJQ0FURS0tLS0tCi0tU1RBUlQgSU5URVJNRURJQVRFIENFUlQtLQotLS0tLUJFR0lOIENFUlRJRklDQVRFLS0tLS0KTUlJRkVqQ0NBL3FnQXdJQkFnSUNFQUF3RFFZSktvWklodmNOQVFFTEJRQXdnYXd4Q3pBSkJnTlZCQVlUQWxWVApNUXN3Q1FZRFZRUUlEQUpPV1RFU01CQUdBMVVFQnd3SlEyRnVZWE4wYjNSaE1Sc3dHUVlEVlFRS0RCSlJXaUJKCmJtUjFjM1J5YVdWekxDQk1URU14R3pBWkJnTlZCQXNNRWxGYUlFbHVaSFZ6ZEhKcFpYTXNJRXhNUXpFWk1CY0cKQTFVRUF3d1FjWHBwYm1SMWMzUnlhV1Z6TG1OdmJURW5NQ1VHQ1NxR1NJYjNEUUVKQVJZWWMzVndjRzl5ZEVCeAplbWx1WkhWemRISnBaWE11WTI5dE1CNFhEVEUxTURNd01qQXdOVEF4T0ZvWERUTTFNRE13TWpBd05UQXhPRm93CmdaZ3hDekFKQmdOVkJBWVRBbFZUTVFzd0NRWURWUVFJREFKT1dURWJNQmtHQTFVRUNnd1NVVm9nU1c1a2RYTjAKY21sbGN5d2dURXhETVJzd0dRWURWUVFMREJKUldpQkpibVIxYzNSeWFXVnpMQ0JNVEVNeEdUQVhCZ05WQkFNTQpFSEY2YVc1a2RYTjBjbWxsY3k1amIyMHhKekFsQmdrcWhraUc5dzBCQ1FFV0dITjFjSEJ2Y25SQWNYcHBibVIxCmMzUnlhV1Z6TG1OdmJUQ0NBaUl3RFFZSktvWklodmNOQVFFQkJRQURnZ0lQQURDQ0Fnb0NnZ0lCQU5URGdOTFUKaW9obC9yUW9aMmJUTUhWRWsxbUEwMjBMWWhnZldqTzArR3NMbGJnNVN2V1ZGV2t2NFpnZmZ1VlJYTEhyd3oxSApZcE15bytaaDhrc0pGOXNzSldDd1FHTzVjaU02ZG1vcnl5QjBWWkhHWTFibGV3ZE11eGllWFA3S3I2WEQzR1JNCkdBaEV3VHhqVXpJM2tzdVJ1blg0SWNuUlhLWWtnNXBqczRuTEVoWHRJWldETGlYUFVzeVVBRXExVTFxZEwxQUgKRXRkSy9MM3pMQVRuaFBCNlppTStIek5HNGFBUHluU0EzOGZwZWVaNFIwdElOTXBGVGh3TmdHVXN4WUtzUDlraAowZ3hHbDhZSEw2WnpDN0JDOEZYSUIvMFd0ZW5nMCtYTEFWdG81NlB5eHQ3QmR4dE5WdVZOTlhna0NpOXRNcVZYCnhPazNvSXZPRER0MFVvUVVaL3VtVXVvTXVPTGVrWVVwWlZrNHV0Q3FYWGxCNG1WZlM1L3pXQjZuVnhGWDhJbzEKOUZPaURMVHdaVnRCbXptZWlremI2bzFRTHA5RjJUQXZsZjgrRElHRE9vMERwUFFVdE9VeUxQQ2g1aEJhREdGRQpaaEU1NnFQQ0JpUUljNFQya2xXWC84MEM1TlpuZC90Sk54anlVeWs3YmpkRHpoelQxMENHUkFzcXhBbnNqdk1ECjJLY01mM29YTjRQTmd5ZnBiZnEyaXB4SjF1Nzc3R3BienlmMHhvS3dIOUZZaWdtcWZSSDJOMnBFZGlZYXdLclgKNnB5WHpHTTRjdlE1WDFZeGYyeC8reGRUTGRWYUxuWmd3cmRxd0ZZbURlakdBbGRYbFlEbDNqYkJIVk0xdit1WQo1SXRHVGprKzN2THJ4bXZHeTVYRlZHKzhmRi94YVZmbzVUVzVBZ01CQUFHalVEQk9NQjBHQTFVZERnUVdCQlNRCnBsQzNoTlM1NmwveUJZUVRlRVhvcVhWVVhEQWZCZ05WSFNNRUdEQVdnQlFEUmNaTndQcU9xUXZhZ3c5QnBXMFMKQmtPcFhqQU1CZ05WSFJNRUJUQURBUUgvTUEwR0NTcUdTSWIzRFFFQkN3VUFBNElCQVFBSklPOFNpTnI5anBMUQplVXNGVW1idWVveHlJNUwrUDVlVjkyY2VWT0oydEFsQkExM3Z6RjFOV2xwU2xyTW1RY1ZVRS9LNEQwMXF0cjBrCmdEczZMVUh2ajJYWExweUVvZ2l0YkJnaXBrUXB3Q1RKVmZDOWJXWUJ3RW90QzdZOG1WampFVjd1WEFUNzFHS1QKeDhYbEI5bWFmK0JUWkdneW91bEE1cFRZSisrN3MveFg5Z3pTV0NhK2VYR2NqZ3VCdFlZWGFBampBcUZHUkF2dQpwejF5ckRXY0E2SDk0SGVFckpLVVhCYWtTMEptL1YzM0pEdVZYWSthWjhFUWkya1Y4MmFaYk5kWGxsL1I2aUd3CjJ1cjRyREVybkhzaXBoQmdaQjcxQzVGRDRjZGZTT05Uc1l4bVBteVViNVQrS0xVb3V4WjlCMFdoMjh1Y2MxTHAKcmJPN0JualcKLS0tLS1FTkQgQ0VSVElGSUNBVEUtLS0tLQ=="; // Placeholder for your actual certificate

            if (certificate && certificate !== "LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUV5akNDQXJLZ0F3SUJBZ0lRTnpreU1ESTFNRGN5TkRFMk16TXpOakFOQmdrcWhraUc5dzBCQVEwRkFEQ0IKbURFTE1Ba0dBMVVFQmhNQ1ZWTXhDekFKQmdOVkJBZ01BazVaTVJzd0dRWURWUVFLREJKUldpQkpibVIxYzNSeQphV1Z6TENCTVRFTXhHekFaQmdOVkJBc01FbEZhSUVsdVpIVnpkSEpwWlhNc0lFeE1RekVaTUJjR0ExVUVBd3dRCmNYcHBibVIxYzNSeWFXVnpMbU52YlRFbk1DVUdDU3FHU0liM0RRRUpBUllZYzNWd2NHOXlkRUJ4ZW1sdVpIVnoKZEhKcFpYTXVZMjl0TUI0WERUSTFNRGN5TkRFMk16TXpObG9YRFRJMU1Ea3lNakUxTlRneU5sb3dnWU14Q3pBSgpCZ05WQkFZTUFreENNUTR3REFZRFZRUUlEQVZPYjNKMGFERVFNQTRHQTFVRUJ3d0hWSEpwY0c5c2FURU1NQW9HCkExVUVDZ3dEUmsxRE1Rd3dDZ1lEVlFRTERBTkdUVU14RERBS0JnTlZCQU1NQTBaTlF6RW9NQ1lHQ1NxR1NJYjMKRFFFSkFRd1pZV2h0WVdRdVluTmhkQzR4TlM0elFHZHRZV2xzTG1OdmJUQ0NBU0l3RFFZSktvWklodmNOQVFFQgpCUUFEZ2dFUEFEQ0NBUW9DZ2dFQkFKemdSem5FYmNTenFPWThyeGRQZUw4WW5vN1RDUktvTGFCbUlUMmtXd1dRCnhBS0V1WVFURFFLVTRhWFRnZTJlY2VCSDF0T3RjMHA5NHJPOTQrVDRmVWRnSGJzOUNqbWIvYzhCOUpHMnN6M3YKenU4T1BjSEllUC8wN3FSa3c3ZmoyQWZrL1g1a3lZdFNWUUQxaWJGMnBHTzlqQnpXNXkvMmxMZk1nNWdtbDZUYgpSemFyZ2lmRG5aOFVnMWFkamJmQXpyVXNmUU5VY0IybkdvQ09MTEx1OTJySVdlalpzdmVhWFlaUlRaS3FIUTAyCitZcmhNWFhSSURaeWVhVm9INTluZ2xVamxiTFVJZ1ZiU21RaDBOSDNkMkhNY3JXRGJQN1JWYTJZZ1JjWSt1bUgKZDdMY2hDU1hKaXdGcncvTVpMTDN1clVxSFluR0ZiZTJyUGRDcTIySlc5RUNBd0VBQWFNak1DRXdId1lEVlIwagpCQmd3Rm9BVWtLWlF0NFRVdWVwZjhnV0VFM2hGNktsMVZGd3dEUVlKS29aSWh2Y05BUUVOQlFBRGdnSUJBTGk4CllnWWs1TUdJZTdEaUFSWjlaVFlZazh3UjlZNTloVktNRm9XWHdBT1g4bVk2ZVhFa1hsZGl3ZnFRNktTUVN1WFMKblpHclJHanF4bzZwaEdhMVhoUXRaZHdnbUh0c3NEREp1MEdIYXNxRlVhN0dRRHBSVjZWNDNZT0pQbGUyKzl4LwoyRDh1UEhNeGRDeVBsSE5RU1RYak1xeVBGN1dsbDh5TzF2aVhyUGRudW82N0ViWUVEWm9PS1g4dk0wbFhEcFA1CmkwcmV1OEJaS2Fyd3FLUzg3N3dTR1JnVGZvQjhuRGExMWZHcHc0aXdzVWJUcThpYXBoVlA2ZG5RemJOZnIzTjMKZVhxbGdrTmkxRjFOdC9sVmV4RUVNdkhDQ1dqdVA3QVVUbzhNTVRBaldRUkdkSmxmMllaU2FVYVUreWlOVE1sbwpRMU1BOTEyVkI5UzZxWncrTUxaV0FZemhZYnZBcWVaa1lvRW1wNVZwSThtSHBsalVKMThaaFBIZDJZYWVYd3MzCjdQYkxLTE51VDA1TFEvUnAxV2wyNVpaaG9PN0tiYVNISWRzc3dCcTRsZHRiY1NaZUIvZ0NTVXlLWkJqcE9pRzgKRURydnRoOU10RlA2QW15aUJhMEhpSWJDaE51OTdid1pBMFpxRDR2ZmNaV3BxL0hGY29WU3d3TlJ0SmVRNU9ZOAprMzNXcGxWT1FVMGtOOW03K2pkaUlUNHVKTy85WDNTa0FubEgyN01ubUdYVkdFSmw0MEJnWEkxNDRYbzBybzlDClR4dWFZOVJNam9zc0hnVUJOeHZGUVRvSFp1V0dza3RBR0RMY0NxQlJjL01wOFBnRGc1WndOOFdtVysxTGdUZ28KOGN5UWdsYUc3eG1iNHROTjF1clI0WncrMC9DZ1I2ZjQ0ampUOGVEUQotLS0tLUVORCBDRVJUSUZJQ0FURS0tLS0tCi0tU1RBUlQgSU5URVJNRURJQVRFIENFUlQtLQotLS0tLUJFR0lOIENFUlRJRklDQVRFLS0tLS0KTUlJRkVqQ0NBL3FnQXdJQkFnSUNFQUF3RFFZSktvWklodmNOQVFFTEJRQXdnYXd4Q3pBSkJnTlZCQVlUQWxWVApNUXN3Q1FZRFZRUUlEQUpPV1RFU01CQUdBMVVFQnd3SlEyRnVZWE4wYjNSaE1Sc3dHUVlEVlFRS0RCSlJXaUJKCmJtUjFjM1J5YVdWekxDQk1URU14R3pBWkJnTlZCQXNNRWxGYUlFbHVaSFZ6ZEhKcFpYTXNJRXhNUXpFWk1CY0cKQTFVRUF3d1FjWHBwYm1SMWMzUnlhV1Z6TG1OdmJURW5NQ1VHQ1NxR1NJYjNEUUVKQVJZWWMzVndjRzl5ZEVCeAplbWx1WkhWemRISnBaWE11WTI5dE1CNFhEVEUxTURNd01qQXdOVEF4T0ZvWERUTTFNRE13TWpBd05UQXhPRm93CmdaZ3hDekFKQmdOVkJBWVRBbFZUTVFzd0NRWURWUVFJREFKT1dURWJNQmtHQTFVRUNnd1NVVm9nU1c1a2RYTjAKY21sbGN5d2dURXhETVJzd0dRWURWUVFMREJKUldpQkpibVIxYzNSeWFXVnpMQ0JNVEVNeEdUQVhCZ05WQkFNTQpFSEY2YVc1a2RYTjBjbWxsY3k1amIyMHhKekFsQmdrcWhraUc5dzBCQ1FFV0dITjFjSEJ2Y25SQWNYcHBibVIxCmMzUnlhV1Z6TG1OdmJUQ0NBaUl3RFFZSktvWklodmNOQVFFQkJRQURnZ0lQQURDQ0Fnb0NnZ0lCQU5URGdOTFUKaW9obC9yUW9aMmJUTUhWRWsxbUEwMjBMWWhnZldqTzArR3NMbGJnNVN2V1ZGV2t2NFpnZmZ1VlJYTEhyd3oxSApZcE15bytaaDhrc0pGOXNzSldDd1FHTzVjaU02ZG1vcnl5QjBWWkhHWTFibGV3ZE11eGllWFA3S3I2WEQzR1JNCkdBaEV3VHhqVXpJM2tzdVJ1blg0SWNuUlhLWWtnNXBqczRuTEVoWHRJWldETGlYUFVzeVVBRXExVTFxZEwxQUgKRXRkSy9MM3pMQVRuaFBCNlppTStIek5HNGFBUHluU0EzOGZwZWVaNFIwdElOTXBGVGh3TmdHVXN4WUtzUDlraAowZ3hHbDhZSEw2WnpDN0JDOEZYSUIvMFd0ZW5nMCtYTEFWdG81NlB5eHQ3QmR4dE5WdVZOTlhna0NpOXRNcVZYCnhPazNvSXZPRER0MFVvUVVaL3VtVXVvTXVPTGVrWVVwWlZrNHV0Q3FYWGxCNG1WZlM1L3pXQjZuVnhGWDhJbzEKOUZPaURMVHdaVnRCbXptZWlremI2bzFRTHA5RjJUQXZsZjgrRElHRE9vMERwUFFVdE9VeUxQQ2g1aEJhREdGRQpaaEU1NnFQQ0JpUUljNFQya2xXWC84MEM1TlpuZC90Sk54anlVeWs3YmpkRHpoelQxMENHUkFzcXhBbnNqdk1ECjJLY01mM29YTjRQTmd5ZnBiZnEyaXB4SjF1Nzc3R3BienlmMHhvS3dIOUZZaWdtcWZSSDJOMnBFZGlZYXdLclgKNnB5WHpHTTRjdlE1WDFZeGYyeC8reGRUTGRWYUxuWmd3cmRxd0ZZbURlakdBbGRYbFlEbDNqYkJIVk0xdit1WQo1SXRHVGprKzN2THJ4bXZHeTVYRlZHKzhmRi94YVZmbzVUVzVBZ01CQUFHalVEQk9NQjBHQTFVZERnUVdCQlNRCnBsQzNoTlM1NmwveUJZUVRlRVhvcVhWVVhEQWZCZ05WSFNNRUdEQVdnQlFEUmNaTndQcU9xUXZhZ3c5QnBXMFMKQmtPcFhqQU1CZ05WSFJNRUJUQURBUUgvTUEwR0NTcUdTSWIzRFFFQkN3VUFBNElCQVFBSklPOFNpTnI5anBMUQplVXNGVW1idWVveHlJNUwrUDVlVjkyY2VWT0oydEFsQkExM3Z6RjFOV2xwU2xyTW1RY1ZVRS9LNEQwMXF0cjBrCmdEczZMVUh2ajJYWExweUVvZ2l0YkJnaXBrUXB3Q1RKVmZDOWJXWUJ3RW90QzdZOG1WampFVjd1WEFUNzFHS1QKeDhYbEI5bWFmK0JUWkdneW91bEE1cFRZSisrN3MveFg5Z3pTV0NhK2VYR2NqZ3VCdFlZWGFBampBcUZHUkF2dQpwejF5ckRXY0E2SDk0SGVFckpLVVhCYWtTMEptL1YzM0pEdVZYWSthWjhFUWkya1Y4MmFaYk5kWGxsL1I2aUd3CjJ1cjRyREVybkhzaXBoQmdaQjcxQzVGRDRjZGZTT05Uc1l4bVBteVViNVQrS0xVb3V4WjlCMFdoMjh1Y2MxTHAKcmJPN0JualcKLS0tLS1FTkQgQ0VSVElGSUNBVEUtLS0tLQ") {
                resolve(certificate);
            } else {
                console.error("QZ Tray certificate content is missing or placeholder value used.");
                notification.add(_t("QZ Tray certificate is missing. Please configure it in qz_integration.js"), {
                    title: _t("Printing Error"),
                    type: "danger",
                    sticky: true,
                });
                reject("Certificate content is missing.");
            }
        });

        // --- STEP 2: Set Signature Algorithm Promise ---
        qz.security.setSignatureAlgorithmPromise(function(resolve, reject) {
            // IMPORTANT: Replace 'signatureAlgorithm123' with your actual signature algorithm (e.g., "SHA256withRSA").
            var signatureAlgorithm = "SHA256withRSA"; // Placeholder for your actual signature algorithm

            if (signatureAlgorithm && signatureAlgorithm !== "SHA256withRSA") {
                resolve(signatureAlgorithm);
            } else {
                console.error("QZ Tray signature algorithm is missing or placeholder value used.");
                notification.add(_t("QZ Tray signature algorithm is missing. Please configure it in qz_integration.js"), {
                    title: _t("Printing Error"),
                    type: "danger",
                    sticky: true,
                });
                reject("Signature algorithm is missing.");
            }
        });

        // --- STEP 3: Connect to QZ Tray ONLY AFTER security promises are set ---
        try {
            await qz.websocket.connect();
            console.log("QZ Tray Connected Successfully!");
        } catch (error) {
            console.error("QZ Tray Connection Error:", error);
            notification.add(_t("QZ Tray is not running or accessible. Please ensure it's installed and running in your system tray."), {
                title: _t("Printing Error"),
                type: "danger",
                sticky: true,
            });
        }

        const serviceMethods = {
            async printPosReceipt(printerName, receiptRawData) {
                if (!qz.websocket.isActive()) {
                    console.warn("QZ Tray is not connected. Attempting to reconnect...");
                    await qz.websocket.connect(); // Ensure connection before printing
                }
                try {
                    const foundPrinter = await qz.printers.find(printerName);
                    // --- MODIFICATION FOR SILENT PRINTING ---
                    // Pass a configuration object to qz.configs.create()
                    // Set 'forceSet: true' to attempt to bypass print dialogs.
                    // This requires your QZ Tray certificate to have the "Force Set" permission enabled.
                    const config = qz.configs.create(foundPrinter, {
                        forceSet: true
                    });
                    // --- END MODIFICATION ---

                    const printData = [{ type: 'raw', data: receiptRawData }];
                    await qz.print(config, printData);
                    console.log("POS receipt sent successfully.");
                    notification.add(_t("Print job sent successfully to %s.", printerName), { type: "success" });
                } catch (error) {
                    console.error("Error printing POS receipt:", error);
                    notification.add(_t("Error sending print job: %s", error.message), {
                        title: _t("Printing Failed"),
                        type: "danger",
                        sticky: true,
                    });
                }
            }
        };

        return serviceMethods;
    }
};

registry.category("services").add("qzTrayService", qzTrayService);