export class TerminalColors {
  // Reset
  static readonly RESET = "\x1b[0m";
  
  // Text colors
  static readonly BLACK = "\x1b[30m";
  static readonly RED = "\x1b[31m";
  static readonly GREEN = "\x1b[32m";
  static readonly YELLOW = "\x1b[33m";
  static readonly BLUE = "\x1b[34m";
  static readonly MAGENTA = "\x1b[35m";
  static readonly CYAN = "\x1b[36m";
  static readonly WHITE = "\x1b[37m";
  static readonly PURPLE = "\x1b[35m";
  
  // Background colors
  static readonly BG_BLACK = "\x1b[40m";
  static readonly BG_RED = "\x1b[41m";
  static readonly BG_GREEN = "\x1b[42m";
  static readonly BG_YELLOW = "\x1b[43m";
  static readonly BG_BLUE = "\x1b[44m";
  static readonly BG_MAGENTA = "\x1b[45m";
  static readonly BG_CYAN = "\x1b[46m";
  static readonly BG_WHITE = "\x1b[47m";
  
  // Bright background colors
  static readonly BG_BRIGHT_RED = "\x1b[101m";
  static readonly BG_BRIGHT_GREEN = "\x1b[102m";
  
  // Styles
  static readonly BOLD = "\x1b[1m";
  static readonly UNDERLINE = "\x1b[4m";
}