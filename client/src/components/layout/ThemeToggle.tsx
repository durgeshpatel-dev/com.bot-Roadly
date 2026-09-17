import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme, type ThemePreference } from '../../context/ThemeContext';
import { Button } from '../ui/button';
import { Menu, MenuGroup, MenuGroupLabel, MenuPopup, MenuRadioGroup, MenuRadioItem, MenuTrigger } from '../ui/menu';

const options = [
  { value: 'system' as const, label: 'System', Icon: Monitor },
  { value: 'light' as const, label: 'Light', Icon: Sun },
  { value: 'dark' as const, label: 'Dark', Icon: Moon },
];

export function ThemeToggle() {
  const { preference, setPreference } = useTheme();
  const current = options.find((option) => option.value === preference) ?? options[0];
  const CurrentIcon = current.Icon;

  return (
    <Menu>
      <MenuTrigger render={<Button variant="ghost" size="icon" aria-label={`Theme: ${current.label}`} />}>
        <CurrentIcon aria-hidden="true" />
      </MenuTrigger>
      <MenuPopup align="end" className="min-w-36">
        <MenuGroup>
        <MenuGroupLabel>Theme</MenuGroupLabel>
        <MenuRadioGroup value={preference} onValueChange={(value) => setPreference(value as ThemePreference)}>
          {options.map(({ value, label, Icon }) => (
            <MenuRadioItem key={value} value={value}>
              <span className="inline-flex items-center gap-2">
                <Icon aria-hidden="true" />
                {label}
              </span>
            </MenuRadioItem>
          ))}
        </MenuRadioGroup>
        </MenuGroup>
      </MenuPopup>
    </Menu>
  );
}
