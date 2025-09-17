import { User } from "@/model/User";
import { Button ,Text} from "@gluestack-ui/themed";
import {
    Menu,
    MenuItem,
    MenuItemLabel
  } from "@gluestack-ui/themed";
  interface RowAction {
    key: string;
    label: string;
    onSelect: (employee: User) => void;
    disabled?:boolean
  }
  interface RowActionsMenuProps {
    employee: User;
    actions: RowAction[];
  }
const RowActionsMenu : React.FC<RowActionsMenuProps> = ({ employee, actions }) => (
    <Menu
      placement="bottom right"
      trigger={({ ...triggerProps }) => (
        <Button {...triggerProps} size="sm" variant="link" action="negative">
          <Text style={{ color: "#FA8072" }}>More actions</Text>
        </Button>
      )}
    >
      
        {actions.map((action) => (
          <MenuItem
            key={action.key}
            textValue={action.key}
            onPress={() => action.onSelect(employee)}
            disabled={action.disabled}
          >
            <MenuItemLabel style={action.disabled ? { color: "#aaa" } : {color:"#333"}}>{action.label}</MenuItemLabel>
          </MenuItem>
        ))}
      
    </Menu>
  );
  export default RowActionsMenu;