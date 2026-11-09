/* PDFX block entry: publishes window.PDFX for the Export PDF button (src/app/37-ui-pdf-export-hold-slide-confirm.js) */
import {env} from "./00-env.js";
import {renderPdf} from "./11-ui-render.js";
env.PDFX = {version:"2.0.0", render:function(model, assets, libs){ return renderPdf(model, assets, libs||{}); }};
