import { CommonUIModule } from '../webpack';
import { createPropListRegex } from '../utils';
export const Dropdown = Object.values(CommonUIModule).find((mod) => mod?.prototype?.SetSelectedOption && mod?.prototype?.BuildMenu);
const dropdownItemRegex = createPropListRegex(["dropDownControlRef", "description"], false);
export const DropdownItem = Object.values(CommonUIModule).find((mod) => mod?.toString && dropdownItemRegex.test(mod.toString()));
