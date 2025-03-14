
import  continentePT  from "../chatbots/continente.pt";
import portaldasfinancas from "../chatbots/portaldasfinancas.gov.pt";
import cttPT from "../chatbots/ctt.pt";
import { buildTest } from "./test_template";


buildTest('portaldasfinancas.gov.pt', portaldasfinancas)
buildTest('continente.pt', continentePT)
buildTest('ctt.pt', cttPT)