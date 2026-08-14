export type HeaderMenuState = { mobileOpen: boolean; megaOpen: boolean };

export type HeaderMenuAction =
  | { type: "toggle-mobile" }
  | { type: "toggle-mega" }
  | { type: "escape" }
  | { type: "outside" }
  | { type: "navigate" };

export const initialHeaderMenuState: HeaderMenuState = { mobileOpen: false, megaOpen: false };

export function reduceHeaderMenu(state: HeaderMenuState, action: HeaderMenuAction): HeaderMenuState {
  switch (action.type) {
    case "toggle-mobile":
      return state.mobileOpen ? initialHeaderMenuState : { mobileOpen: true, megaOpen: false };
    case "toggle-mega":
      return { ...state, megaOpen: !state.megaOpen };
    case "escape":
      return state.megaOpen ? { ...state, megaOpen: false } : initialHeaderMenuState;
    case "outside":
    case "navigate":
      return initialHeaderMenuState;
    default:
      return state;
  }
}
