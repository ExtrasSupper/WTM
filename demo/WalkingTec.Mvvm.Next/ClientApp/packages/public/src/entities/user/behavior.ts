import lodash from 'lodash';
import { runInAction } from 'mobx';
import { Regulars } from '../../utils/regulars';
import Entities, { MenuDataItem } from './entities';

/**
 * 对象 动作 行为 
 * @export
 * @class EntitiesUserBehavior
 * @extends {Entities}
 */
export default class EntitiesUserBehavior extends Entities {
    // Request = new Request();
    static onMenusMap(Menus) {
        const external = '/external/';
        return Menus.map(data => {
            // 跨域页面
            if (Regulars.url.test(data.Url)) {
                data.Url = external + encodeURIComponent(data.Url);
            } else
                // public 下的 pages 页面
                if (lodash.startsWith(data.Url, external)) {
                    data.Url = external + encodeURIComponent(lodash.replace(data.Url, external, `${window.location.origin}/`));
                }
            return {
                ...data,
                key: data.Id,
                path: data.Url || '',
                name: data.Text,
                icon: data.Icon || "pic-right",
                // children: data.Children
            }
        })
    }
   
    /**
     * 解析菜单 
     * @memberof EntitiesUserBehavior
     */
    async onAnalysisMenus(Menus) {
        Menus = EntitiesUserBehavior.onMenusMap(Menus)
        runInAction(() => {
            this.Menus = Menus;
            this._MenuTrees = this.formatTree(Menus, null, []);
            this.Loading = false;
            this.OnlineState = true;
        })
    }

    /**
    * 递归 格式化 树
    * @param datalist 
    * @param ParentId 
    * @param children 
    */
    formatTree(datalist, ParentId, children: MenuDataItem[] = []) {
        lodash.filter(datalist, ['ParentId', ParentId]).map(data => {
            data = lodash.cloneDeep(data)
            data.children = this.formatTree(datalist, data.Id, data.children || []);
            children.push(data);
        });
        return children;
    }
}