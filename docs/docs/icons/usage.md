---
id: usage
title: Usage
---

import { IconComponent } from "./usage.js"

## Istallation

<p>If you wish to use our icons in your project, we have npm package named "erxes-icon" which you can install with:</p>
<IconComponent type="install" />

## Import

<p>Include popular icons in your projects easily with erxes-icon. Import icons by following code.</p>
<IconComponent type="code" />

## Usage

<p>Add icon to your component to create web or apps that easy to interact with. Refer below code to see how to use and  customize icon with erxes-ui's "Icon" component.</p>

### Icon component

#### Example

<p>To display desired icon write it's name to <code>icon</code> prop.</p> 
<IconComponent type="icon" iconName="envelope-alt" />

#### Color

<p>Give color to icon by <code>color</code> prop.</p>
<IconComponent type="color" iconName="envelope-alt" colors="red"/>

#### Active

<p>When there's <code>active</code> prop, it displays black icon.</p>
<IconComponent type="active" iconName="envelope-alt" colors="red" active={true}/>

#### Size

<p>Change icon size by <code>size</code> prop.</p>
<IconComponent type="size" iconName="envelope-alt" sizes={30}/>

#### API

<IconComponent type="APIicon" table={[
['icon*', 'string', '', 'Define icon'],
['size', 'number', '', 'Changes icon size'],
['style','any', '', 'Gives custom style to icon'],
['color', 'string', 'black', 'Changes icon color'],
['isActive', 'boolean', 'false', 'Make the icon color black'],
['onClick', 'function', '', 'Define click handler function']
]}/>
